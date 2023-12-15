import { EventParser } from "../parser/event.parser";
import { TaskCondition } from "../../builders/condition";
import { TaskMethod } from "../../builders/method";
import { TaskSource, TaskStepEvent } from "../../builders/operation/task";
import { TaskAction, TaskLogModel, TaskModel } from "./task.model";
import { NesoiError } from "../../error";
import { NesoiClient } from "../../client";
import { Condition } from "../condition";
import { Extra } from "../extra";
import { ScheduleResource } from "./schedule";
import { Resource } from "../resource";
import { ScheduleEventType } from "./schedule.model";

export class TaskStep {
    public state: string
    public eventParser: EventParser<any>
    public conditionsAndExtras: (
        TaskCondition<any, any, any>
        | TaskMethod<any,any,any,any>
    )[]
    public fn: TaskMethod<any, any, any, any>

    constructor (builder: any) {
        this.state = builder.state
        this.eventParser = new EventParser('', builder.eventParser)
        this.conditionsAndExtras = builder.conditionsAndExtras
        this.fn = builder.fn
    }

    public async run (client: any, eventRaw: any, taskInput: any) {
        const event = await this.eventParser.parse(eventRaw);
        for (let i in this.conditionsAndExtras) {
            if (typeof this.conditionsAndExtras[i] === 'function') {
                const extra = this.conditionsAndExtras[i] as TaskMethod<any,any,any,any>;
                await Extra.run(extra,
                    { client, event, input: taskInput },
                    event)
            }
            else {
                const condition = this.conditionsAndExtras[i] as TaskCondition<any, any, any>;
                await Condition.check(condition,
                    { client, event, input: taskInput })
            }
        }

        if (!this.fn) {
            return { event, outcome: {} }
        }

        const promise = this.fn({ client, event, input: taskInput });
        const outcome = await Promise.resolve(promise)
        return { event, outcome }
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
    public scheduleResource: Resource<any,any,any>

    constructor(builder: any) {
        this.dataSource = builder.dataSource
        this.name = builder.name
        this.requestStep = builder.requestStep.build()
        this.steps = builder.steps.map(
            (step: any) => step.build()
        )
        this.scheduleResource = ScheduleResource(builder.engine, this.dataSource.schedules)
    }

    public async request(
        client: Client,
        eventRaw: TaskStepEvent<RequestStep>
    ) {
        // 1. Create task entry
        const { event, task } = await this._request(client, eventRaw)
        
        // 2. Save entry on data source
        const savedTask = await this.dataSource.tasks.put(client, task)

        // 3. Log
        await this.logStep(client, 'request', savedTask, event);
        return savedTask;
    }

    private async _request(
        client: Client,
        eventRaw: TaskStepEvent<RequestStep>
    ) {
        // 1. Run request step to built request object
        const { event, outcome } = await this.requestStep.run(client, eventRaw, {})

        // 2. Create request task
        const task: Omit<TaskModel, 'id'> = {
            type: this.name,
            state: 'requested',
            input: event,
            output: {
                data: {},
                steps: [
                    {
                        user: { 
                            id: client.user.id,
                            name: client.user.name,
                        },
                        timestamp: new Date().toISOString()
                    }
                ]
            },
            graph: {},
            created_by: client.user.id,
            updated_by: client.user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }

        return { event, task };
    }

    public async schedule(
        client: Client,
        schedule: ScheduleEventType,
        eventRaw: TaskStepEvent<RequestStep>
    ) {
        const task = await this.request(client, eventRaw)

        const taskSchedule = await this.scheduleResource.create(client, {
            task_id: task.id,
            ...schedule
        })

        return { task, schedule: taskSchedule };
    }

    public async advance(
        client: Client,
        id: number,
        eventRaw: TaskStepEvent<Steps>
    ) {
        // 1. Get task by ID
        const task = await this.dataSource.tasks.get(client, id)
        if (!task) {
            throw NesoiError.Task.NotFound(this.name, id)
        }

        // 2. Advance the task
        const { event } = await this._advance(client, task, eventRaw);

        // 3. Update task on data source
        await this.dataSource.tasks.put(client, task)

        // 4. Log
        await this.logStep(client, 'advance', task, event);

        return task
    }

    private async _advance(
        client: Client,
        task:  Omit<TaskModel, 'id'> & { id?: number },
        eventRaw: TaskStepEvent<Steps>
    ) {
        // 1. Get current and next steps
        const { current, next } = this.getStep(task.state)
        if (!current) {
            if (task.id) {
                throw NesoiError.Task.InvalidState(this.name, task.id, task.state)
            }
            else {
                throw NesoiError.Task.InvalidStateExecute(this.name, task.state)
            }
        }

        // 2. Run step
        const { event, outcome } = await current.run(client, eventRaw, task.input);
        if (!task.output.data) {
            task.output.data = {}
        }
        Object.assign(task.input, event)
        Object.assign(task.output.data, outcome)
        task.output.steps.push({
            user: { 
                id: client.user.id,
                name: client.user.name,
            },
            timestamp: new Date().toISOString()
        })

        // 3. Advance
        if (next) {
            task.state = next.state as any
        }
        else {
            task.state = 'done'
        }

        task.updated_by = client.user.id
        task.updated_at = new Date().toISOString()

        return { event, task }
    }

    public async execute(
        client: Client,
        input: TaskStepEvent<RequestStep> & TaskStepEvent<Steps>
    ) {
        const { event, task } = await this._request(client, input);
        const fullEvent = event;
        while (task.state !== 'done') {
            const { event } = await this._advance(client, task, input)
            Object.assign(fullEvent, event);
        }

        // 2. Save task on data source
        const savedTask = await this.dataSource.tasks.put(client, task)

        // 3. Log
        await this.logStep(client, 'execute', savedTask, fullEvent);
        return savedTask;
    }

    public async comment(
        client: Client,
        id: number,
        comment: string
    ) {
        // 1. Read task by id
        const task = await this.dataSource.tasks.get(client, id)
        if (!task) {
            throw NesoiError.Task.NotFound(this.name, id)
        }

        // 2. Store comment as log
        const log: Omit<TaskLogModel<any>, 'id'> = {
            task_id: task.id,
            task_type: this.name,
            action: 'comment',
            state: task.state,
            message: comment,
            timestamp: new Date().toISOString(),
            user: (client.user as any).name,
            created_by: client.user.id,
            updated_by: client.user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
        await this.dataSource.logs.put(client, log)
    }

    private getStep(state: string) {
        const index = this.steps.findIndex(step => step.state === state);
        return {
            current: this.steps[index],
            next: this.steps[index+1]
        }
    }

    private async logStep<Event>(client: Client, action: TaskAction, task: TaskModel, event: Event) {
        const log: Omit<TaskLogModel<any>, 'id'> = {
            task_id: task.id,
            task_type: this.name,
            action,
            state: task.state,
            message: `Task advanced to state ${task.state}`,
            event,
            timestamp: new Date().toISOString(),
            user: (client.user as any).name,
            created_by: client.user.id,
            updated_by: client.user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
        await this.dataSource.logs.put(client, log)
    }
}
