import { TaskStepEvent } from "./builders/operation/task"
import { NesoiEngine } from "./engine"
import { DataSource } from "./engine/data/datasource"
import { Task } from "./engine/operation/task"

export type Client = {
    user: {
        id: number | string
    }
}

class NesoiDataClient<
    Engine extends NesoiEngine<any,any,any,any>,
> {
    constructor(
        protected engine: Engine,
        protected client: NesoiClient<any,any>,
    ) {}
   
    readOne<S extends keyof Engine['sources']>(
        source: S,
        id: Engine['sources'][S]['id']
    ) {
        type Source = InstanceType<Engine['sources'][S]>
        const sourceClass = this.engine.sources[source] as any
        const data = new sourceClass() as Source
        return data.get(this.client, id) as Source['$obj']
    }

    _readOne(
        source: string,
        id: number | string
    ) {
        type Source = InstanceType<Engine['sources'][any]>
        const sourceClass = this.engine.sources[source] as any
        const data = new sourceClass() as Source
        return data.get(this.client, id)
    }

    readAll<S extends keyof Engine['sources']>(
        source: S
    ) {
        type Source = InstanceType<Engine['sources'][S]>
        const sourceClass = this.engine.sources[source] as any
        const data = new sourceClass() as Source
        return data.index(this.client)
    }

    _readAll(
        source: string
    ) {
        type Source = InstanceType<Engine['sources'][any]>
        const sourceClass = this.engine.sources[source] as any
        const data = new sourceClass() as Source
        return data.index(this.client)
    }

}

class NesoiTaskClient<
    Engine extends NesoiEngine<any,any,any,any>
> {
    constructor(
        protected engine: Engine,
        protected client: NesoiClient<any,any>
    ) {}

    /**
     * Create an task at the "requested" state
     * @param task Nesoi.task object
     * @param input Input to the task request
     * @returns Newly created task with generated id
     */
    request<
        A extends Task<any,any>
    >(
        task: A,
        input: TaskStepEvent<A['requestStep']>
    ) {
        return task.request(this.client, input as never)
    }

    _request(
        taskName: keyof Engine['tasks'],
        input: Record<string, any>
    ) {
        const task = this.engine.tasks[taskName];
        return task.request(this.client, input as never)
    }

    advance<
        A extends Task<any,any>
    >(
        task: A,
        id: number,
        input: TaskStepEvent<A['steps'][number]>
    ) {
        return task.advance(this.client, id, input as never)
    }

    _advance(
        taskName: keyof Engine['tasks'],
        id: number,
        input: Record<string, any>
    ) {
        const task = this.engine.tasks[taskName];
        return task.advance(this.client, id, input as never)
    }

    comment<
        A extends Task<any,any>
    >(
        task: A,
        id: number,
        comment: string
    ) {
        return task.comment(this.client, id, comment)
    }

    _comment(
        taskName: keyof Engine['tasks'],
        id: number,
        comment: string
    ) {
        const task = this.engine.tasks[taskName];
        return task.comment(this.client, id, comment)
    }
}

export class NesoiClient<
    Engine extends NesoiEngine<any,any,any,any>,
    AppClient extends Client
> {
    public data: NesoiDataClient<Engine>
    public task: NesoiTaskClient<Engine>

    constructor(
        protected engine: Engine,
        protected client: AppClient,
        public user = client.user as AppClient['user']
    ) {
        this.data = new NesoiDataClient(engine, this)
        this.task = new NesoiTaskClient(engine, this)
        Object.assign(this, client)
    }
}