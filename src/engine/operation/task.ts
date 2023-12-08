import { EventParser } from "../parser/event.parser";
import { TaskCondition } from "../../builders/condition";
import { TaskMethod } from "../../builders/method";
import { TaskSource, TaskStepBuilder, TaskStepEvent } from "../../builders/operation/task";
import { TaskAction, TaskLogModel, TaskModel } from "./task.model";
import { DataSource } from "../data/datasource";
import { NesoiError } from "../../error";
import { NesoiClient } from "../../client";
import { Condition } from "../condition";
import { Extra } from "../extra";

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

    public async run (client: any, eventRaw: any, request: any) {
        const event = await this.eventParser.parse(eventRaw);
        for (let i in this.conditionsAndExtras) {
            if (typeof this.conditionsAndExtras[i] === 'function') {
                const extra = this.conditionsAndExtras[i] as TaskMethod<any,any,any,any>;
                await Extra.run(extra,
                    { client, event, request },
                    event)
            }
            else {
                const condition = this.conditionsAndExtras[i] as TaskCondition<any, any, any>;
                await Condition.check(condition,
                    { client, event, request })
            }
        }

        if (!this.fn) {
            return { event, outcome: {} }
        }

        const promise = this.fn({ client, event, request: request });
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
        // 1. Create task entry
        const { event, entry } = await this._request(client, input)
        
        // 2. Save entry on data source
        const task = await this.dataSource.tasks.put(client, entry)

        // 3. Log
        await this.logStep(client, 'request', task, event);
        return task;
    }

    private async _request(
        client: Client,
        input: TaskStepEvent<RequestStep>
    ) {
        // 1. Run request step to built request object
        const { event, outcome } = await this.requestStep.run(client, input, {})

        // 2. Create request task
        const entry: Omit<TaskModel, 'id'> = {
            type: this.name,
            state: 'requested',
            request: event,
            outcome,
            graph: {},
            created_by: client.user.id,
            updated_by: client.user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }

        return { event, entry };
    }

    public async advance(
        client: Client,
        id: number,
        input: TaskStepEvent<Steps>
    ) {
        // 1. Get task by ID
        const task = await this.dataSource.tasks.get(client, id)
        if (!task) {
            throw NesoiError.Task.NotFound(this.name, id)
        }

        // 2. Advance the task
        const { event } = await this._advance(client, task, input);

        // 3. Update task on data source
        await this.dataSource.tasks.put(client, task)

        // 4. Log
        await this.logStep(client, 'advance', task, event);

        return task
    }

    private async _advance(
        client: Client,
        task:  Omit<TaskModel, 'id'> & { id?: number },
        input: TaskStepEvent<Steps>
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
        const { event, outcome } = await current.run(client, input, task.request);
        if (!task.outcome) {
            task.outcome = {}
        }
        Object.assign(task.request, event)
        Object.assign(task.outcome, outcome)

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
        const { event, entry } = await this._request(client, input);
        const fullEvent = event;
        while (entry.state !== 'done') {
            const { event } = await this._advance(client, entry, input)
            Object.assign(fullEvent, event);
        }

        // 2. Save entry on data source
        const task = await this.dataSource.tasks.put(client, entry)

        // 3. Log
        await this.logStep(client, 'execute', task, fullEvent);
        return entry;
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
