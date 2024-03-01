import { EventParser } from "../parser/event.parser";
import { TaskCondition } from "../../builders/condition";
import { TaskMethod } from "../../builders/method";
import { TaskSource, TaskStepAlias, TaskStepEvent } from "../../builders/operation/task";
import { TaskAction, TaskLogModel, TaskModel, TaskState } from "./task.model";
import { NesoiError } from "../../error";
import { NesoiClient } from "../../client";
import { Condition } from "../condition";
import { Extra } from "../extra";
import { ScheduleResource } from "./schedule";
import { Resource } from "../resource";
import { ScheduleEventType } from "./schedule.model";
import { TaskGraph } from "./graph";
import { NesoiEngine } from "../../engine";

export class TaskStep {
    public alias?: TaskStepAlias
    public state: string
    public eventParser: EventParser<any>
    public conditionsAndExtras: (
        TaskCondition<any, any, any>
        | TaskMethod<any,any,any,any>
    )[]
    public fn: TaskMethod<any, any, any, any>
    public logFn?: TaskMethod<any, any, any, string>

    constructor (builder: any) {
        this.alias = builder.alias
        this.state = builder.state
        this.eventParser = new EventParser('', builder.eventParser)
        this.conditionsAndExtras = builder.conditionsAndExtras
        this.fn = builder.fn
        this.logFn = builder.logFn
    }

    public async run (client: any, eventRaw: any, taskInput: any, taskId?: number) {
        const event = await this.eventParser.parse(client, eventRaw);
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

        const promise = this.fn({ id: taskId, client, event, input: taskInput });
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

    public engine: NesoiEngine<any,any,any,any>
    public bucket: Source
    public name: string
    public requestStep!: TaskStep & RequestStep
    public steps!: (TaskStep & Steps)[]
    public scheduleResource: Resource<any,any,any>

    constructor(builder: any) {
        this.engine = builder.engine
        this.bucket = builder.bucket
        this.name = builder.name
        this.requestStep = builder.requestStep.build()
        this.steps = builder.steps.map(
            (step: any) => step.build()
        )
        this.scheduleResource = ScheduleResource(builder.engine, this.bucket.schedules)
    }

    public async request(
        client: Client,
        eventRaw: TaskStepEvent<RequestStep>
    ) {
        // 1. Create task entry
        const { event, task } = await this._request(client, eventRaw)
        
        // 2. Save entry on data source
        const savedTask = await this.bucket.tasks.put(client, task)

        // 3. Log
        await this.logStep(client, 'request', savedTask, event);

        return savedTask;
    }

    private async _request(
        client: Client,
        eventRaw: TaskStepEvent<RequestStep>
    ) {
        // 1. Run request step to built request object
        const { event, outcome } = await this.requestStep.run(client, eventRaw, {}, undefined)

        // 2. Create request task
        const task: Omit<TaskModel, 'id'> = {
            type: this.name,
            state: 'requested',
            input: event,
            output: {
                data: {},
                steps: this.getOutputStepList(client)
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
        // 1. Request task
        const { event, task } = await this._request(client, eventRaw)

        // 2. Save entry on data source
        const savedTask = await this.bucket.tasks.put(client, task)

        // 3. Create schedule for task
        const taskSchedule = await this.scheduleResource.create(client, {
            task_id: savedTask.id,
            ...schedule
        })

        // 3. Log
        await this.logStep(client, 'schedule', savedTask, event);

        return { task: savedTask, schedule: taskSchedule };
    }

    public async advance(
        client: Client,
        id: number,
        eventRaw: TaskStepEvent<Steps>
    ) {
        // 1. Get task by ID
        const task = await this.bucket.tasks.get(client, id)
        if (!task) {
            throw NesoiError.Task.NotFound(this.name, id)
        }

        // 2. Advance the task
        const { current, event } = await this._advance(client, task, eventRaw);

        // 3. Update task on data source
        await this.bucket.tasks.put(client, task)

        // 4. Log
        await this.logStep(client, 'advance', task, event, current);

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
        const { event, outcome } = await current.run(client, eventRaw, task.input, task.id);
        if (!task.output.data) {
            task.output.data = {}
        }
        Object.assign(task.input, event)
        Object.assign(task.output.data, outcome)

        // 3. Save step to output
        const outputStep = task.output.steps.find(step => !step.timestamp);
        if (!outputStep || outputStep.from_state !== current.state) {
            if (task.id) {
                throw NesoiError.Task.InvalidOutputStep(this.name, task.id, task.state)
            }
            else {
                throw NesoiError.Task.InvalidOutputStepExecute(this.name, task.state)
            }
        }

        outputStep.user = { 
            id: client.user.id,
            name: client.user.name,
        }
        outputStep.timestamp = new Date().toISOString()

        // 4. Advance
        if (next) {
            task.state = next.state as any
        }
        else {
            task.state = 'done'
        }

        task.updated_by = client.user.id
        task.updated_at = new Date().toISOString()

        return { current, event, task }
    }

    public async execute(
        client: Client,
        eventRaw: TaskStepEvent<RequestStep> & TaskStepEvent<Steps>
    ) {
        const { event, task } = await this._request(client, eventRaw);
        let savedTask = await this.bucket.tasks.put(client, task)

        const fullEvent = event;
        while (savedTask.state !== 'done') {
            const { event } = await this._advance(client, savedTask, eventRaw)
            Object.assign(fullEvent, event);
        }

        // 2. Save task on data source
        savedTask = await this.bucket.tasks.put(client, savedTask)

        // 3. Log
        await this.logStep(client, 'execute', savedTask, fullEvent);
        return savedTask;
    }

    public async comment(
        client: Client,
        id: number,
        message: string,
        event?: Record<string, any>
    ) {
        // 1. Read task by id
        const task = await this.bucket.tasks.get(client, id)
        if (!task) {
            throw NesoiError.Task.NotFound(this.name, id)
        }

        // 2. Store comment as log
        const log: Omit<TaskLogModel<any>, 'id'> = {
            task_id: task.id,
            task_type: this.name,
            action: 'comment',
            state: task.state,
            message,
            event,
            timestamp: new Date().toISOString(),
            user: (client.user as any).name,
            created_by: client.user.id,
            updated_by: client.user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
        await this.bucket.logs.put(client, log)
    }

    public async alterGraph(
        client: Client,
        id: number,
        fn: (graph: TaskGraph) => Promise<void>
    ) {
        // 1. Read task by id
        const task = await this.bucket.tasks.get(client, id)
        if (!task) {
            throw NesoiError.Task.NotFound(this.name, id)
        }

        // 2. Run graph changes
        const graph = new TaskGraph(client, this.bucket.tasks, task);
        await fn(graph)

        // 3. Save task and affected tasks
        for (let t in graph.affectedTasks) {
            const affTask = graph.affectedTasks[t]
            await this.bucket.tasks.put(client, affTask);
        }

        // 4. Save logs
        for (let i in graph.logs) {
            const log = graph.logs[i];
            const from_task = graph.affectedTasks[log.from_task_id]
            const message =  this.engine.string('task.graph.'+log.relation as any) + ` ${log.to_task_id}`
            await this.logGraph(client, from_task, message, log);
        }

        return task
    }

    private getStep(state: string) {
        const index = this.steps.findIndex(step => step.state === state);
        return {
            current: this.steps[index],
            next: this.steps[index+1]
        }
    }

    private getOutputStepList(client: Client, includeRequested = true) {
        
        const list = includeRequested ? [{
            from_state: 'void' as TaskState,
            to_state: 'requested' as TaskState,
            user: { 
                id: client.user.id,
                name: client.user.name,
            },
            timestamp: new Date().toISOString()
        }] : []

        this.steps.forEach((step, i) => {
            list.push({
                from_state: step.state,
                to_state: this.steps[i+1]?.state || 'done'
            } as any)
        })

        return list
    }

    private async logStepMessage(client: Client, action: TaskAction, task: TaskModel, event: any, step?: TaskStep) {
        if (action === 'request') {
            return this.engine.string('task.request.log');
        }
        else if (action === 'schedule') {
            return this.engine.string('task.schedule.log');
        }
        else if (action === 'advance') {
            if (step?.logFn) {
                const promise = step.logFn({
                    id: task.id,
                    client,
                    event,
                    input: task.input
                })
                return Promise.resolve(promise)
            }
            if (step?.alias?.done) {
                return step?.alias?.done
            }
            return this.engine.string('task.advance.log');
        }
        else if (action === 'execute') {
            return this.engine.string('task.execute.log');
        }
        return ''
    }

    private async logStep<Event>(client: Client, action: TaskAction, task: TaskModel, event: Event, step?: TaskStep) {

        const log: Omit<TaskLogModel<any>, 'id'> = {
            task_id: task.id,
            task_type: this.name,
            action,
            state: task.state,
            message: await this.logStepMessage(client, action, task, event, step),
            event,
            timestamp: new Date().toISOString(),
            user: (client.user as any).name,
            created_by: client.user.id,
            updated_by: client.user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
        await this.bucket.logs.put(client, log)
    }

    private async logGraph<Event>(client: Client, task: TaskModel, message: string, event: Event) {
        const log: Omit<TaskLogModel<any>, 'id'> = {
            task_id: task.id,
            task_type: this.name,
            action: 'graph',
            state: task.state,
            message,
            event,
            timestamp: new Date().toISOString(),
            user: (client.user as any).name,
            created_by: client.user.id,
            updated_by: client.user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
        await this.bucket.logs.put(client, log)
    }

    public async cancel(
        client: Client,
        id: number
    ) {
        const task = await this.bucket.tasks.get(client, id)
        task.state = 'canceled'
        task.updated_by = client.user.id
        task.updated_at = new Date().toISOString()
        let savedTask =  await this.bucket.tasks.put(client, task)

        await this.logStep(client, 'cancel', savedTask, null);

        return { task }
    }
}
