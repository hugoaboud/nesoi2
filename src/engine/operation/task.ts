import { EventParser } from "../parser/event.parser";
import { TaskCondition } from "../../builders/condition";
import { TaskMethod } from "../../builders/method";
import { TaskSource, TaskStepBuilder, TaskStepEvent } from "../../builders/operation/task";
import { TaskLogModel, TaskModel } from "./task.model";
import { DataSource } from "../data/datasource";
import { NesoiError } from "../../error";
import { NesoiClient } from "../../client";

export class TaskStep {
    public state: string
    public eventParser: EventParser<any>
    public conditions: TaskCondition<any, any, any>[]
    public fn: TaskMethod<any, any, any, any>

    constructor (builder: any) {
        this.state = builder.state
        this.eventParser = new EventParser('', builder.eventParser)
        this.conditions = builder.conditions
        this.fn = builder.fn
    }
}

export class Task<
    Client extends NesoiClient<any,any>,
    Source extends TaskSource<any,any,any> = never,
    RequestStep = unknown,
    Steps = unknown
> {

    public dataSource: Source
    public name: string
    public requestStep!: TaskStep & RequestStep
    public steps!: (TaskStep & Steps)[]

    constructor(builder: any) {
        this.dataSource = builder.dataSource
        this.name = builder.name
        this.requestStep = builder.requestStep.build()
        this.steps = builder.steps.map(
            (step: any) => step.build()
        )
    }

    public async request(
        client: Client,
        input: TaskStepEvent<RequestStep>
    ) {
        const event = await this.requestStep.eventParser.parse(input as any);
        const entry: Omit<TaskModel, 'id'> = {
            state: 'requested'
        }
        const task = await this.dataSource.tasks.put(entry)
        await this.logStep(client, task, event);
        return task;
    }

    // public schedule(
    //     input: StepEvent<RequestStep>,
    //     start_timestamp: string,
    //     end_timestamp: string
    // ) {}

    public async advance(
        client: Client,
        id: number,
        input: TaskStepEvent<Steps>
    ) {
        const task = await this.dataSource.tasks.get(id)
        if (!task) {
            throw NesoiError.Task.NotFound(this.name, id)
        }
        const { current, next } = this.getStep(task.state)
        if (!current) {
            throw NesoiError.Task.InvalidState(this.name, id, task.state)
        }
        const event = await current.eventParser.parse(input as any);
        const result = await Promise.resolve(
            current.fn({ client, event, input: task.input })
        )
        if (result === 'canceled') {
            task.state = 'canceled';
        }
        else if (result === 'pass') {
            if (next) {
                task.state = next.state as any
            }
            else {
                task.state = 'done'
            }
        }
        await this.logStep(client, task, event);
        await this.dataSource.tasks.put(task)
        return task
    }

    public async comment(
        client: Client,
        id: number,
        comment: string
    ) {
        const task = await this.dataSource.tasks.get(id)
        if (!task) {
            throw NesoiError.Task.NotFound(this.name, id)
        }
        const log: Omit<TaskLogModel<any>, 'id'> = {
            task_id: task.id,
            type: 'comment',
            state: task.state,
            message: comment,
            timestamp: new Date().toISOString(),
            user_id: client.user.id
        }
        await this.dataSource.logs.put(log)
    }

    private getStep(state: string) {
        const index = this.steps.findIndex(step => step.state === state);
        return {
            current: this.steps[index],
            next: this.steps[index+1]
        }
    }

    private async logStep<Event>(client: Client, task: TaskModel, event: Event) {
        const log: Omit<TaskLogModel<any>, 'id'> = {
            task_id: task.id,
            type: 'step',
            state: task.state,
            message: `Task advanced to state ${task.state}`,
            event,
            timestamp: new Date().toISOString(),
            user_id: client.user.id
        }
        await this.dataSource.logs.put(log)
    }
}
