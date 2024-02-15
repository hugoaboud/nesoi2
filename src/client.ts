import { TaskStepEvent } from "./builders/operation/task"
import { NesoiEngine } from "./engine"
import { Bucket } from "./engine/data/bucket"
import { NesoiObj } from "./engine/data/model"
import { TaskGraph } from "./engine/operation/graph"
import { ScheduleEventType } from "./engine/operation/schedule.model"
import { Task } from "./engine/operation/task"
import { NesoiError } from "./error"

export type Client = {
    user: {
        id: number | string
    }
    trx: any
}

class NesoiDataClient<
    Engine extends NesoiEngine<any,any,any,any>,
> {
    constructor(
        protected engine: Engine,
        protected client: NesoiClient<any,any>,
    ) {}
   
    readOne<S extends keyof Engine['buckets']>(
        source: S,
        id: Engine['buckets'][S]['id'],
        view?: keyof Engine['buckets'][S]['views']
    ) {
        type Obj = Engine['buckets'][S]['#obj']
        const bucket = this.engine.buckets[source] as any as Bucket<Obj>
        return bucket.get(this.client, id, view as any)
    }

    _readOne(
        source: string,
        id: number | string,
        view?: string
    ) {
        const bucket = this.engine.buckets[source] as any as Bucket<NesoiObj>
        return bucket.get(this.client, id, view as any)
    }

    readOneOrFail<S extends keyof Engine['buckets']>(
        source: S,
        id: Engine['buckets'][S]['id'],
        view?: keyof Engine['buckets'][S]['views']
    ) {
        return this.readOne(source, id, view).then(obj => {
            if (obj === undefined || obj === null) {
                throw NesoiError.Resource.NotFound(source as string, id)
            }
            return obj
        })
    }

    _readOneOrFail(
        source: string,
        id: number | string,
        view?: string
    ) {
        return this._readOne(source, id, view).then(obj => {
            if (obj === undefined) {
                throw NesoiError.Resource.NotFound(source as string, id)
            }
            return obj
        })
    }

    readAll<S extends keyof Engine['buckets']>(
        source: S,
        view?: keyof Engine['buckets'][S]['views']
    ) {
        type Obj = Engine['buckets'][S]['#obj']
        const bucket = this.engine.buckets[source] as any as Bucket<Obj>
        return bucket.index(this.client, view as any)
    }

    _readAll(
        source: string,
        view?: string
    ) {
        const bucket = this.engine.buckets[source] as any as Bucket<NesoiObj>
        return bucket.index(this.client, view as any)
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
        if (!task) {
            throw NesoiError.Task.Invalid(taskName as string)
        }
        return task.request(this.client, input as never)
    }
    
    schedule<
        A extends Task<any,any>
    >(
        task: A,
        schedule: ScheduleEventType,
        input: TaskStepEvent<A['requestStep']>,
    ) {
        return task.schedule(this.client, schedule, input)
    }

    _schedule(
        taskName: keyof Engine['tasks'],
        schedule: ScheduleEventType,
        input: Record<string, any>
    ) {
        const task = this.engine.tasks[taskName];
        if (!task) {
            throw NesoiError.Task.Invalid(taskName as string)
        }
        return task.schedule(this.client, schedule, input as never)
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
        if (!task) {
            throw NesoiError.Task.Invalid(taskName as string)
        }
        return task.advance(this.client, id, input as never)
    }

    execute<
        A extends Task<any,any>
    >(
        task: A,
        input: TaskStepEvent<A['requestStep']> & TaskStepEvent<A['steps'][number]>
    ) {
        return task.execute(this.client, input as never)
    }

    _execute(
        taskName: keyof Engine['tasks'],
        input: Record<string, any>
    ) {
        const task = this.engine.tasks[taskName];
        if (!task) {
            throw NesoiError.Task.Invalid(taskName as string)
        }
        return task.execute(this.client, input as never)
    }

    comment<
        A extends Task<any,any>
    >(
        task: A,
        id: number,
        comment: string,
        extra?: Record<string, any>
    ) {
        return task.comment(this.client, id, comment, extra)
    }

    _comment(
        taskName: keyof Engine['tasks'],
        id: number,
        comment: string,
        extra?: Record<string, any>
    ) {
        const task = this.engine.tasks[taskName];
        if (!task) {
            throw NesoiError.Task.Invalid(taskName as string)
        }
        return task.comment(this.client, id, comment, extra)
    }

    alterGraph<
        A extends Task<any,any>
    >(
        task: A,
        id: number,
        fn: (graph: TaskGraph) => Promise<void>
    ) {
        return task.alterGraph(this.client, id, fn);
    }

    _alterGraph(
        taskName: keyof Engine['tasks'],
        id: number,
        fn: (graph: TaskGraph) => Promise<void>
    ) {
        const task = this.engine.tasks[taskName];
        if (!task) {
            throw NesoiError.Task.Invalid(taskName as string)
        }
        return task.alterGraph(this.client, id, fn);
    }
}

export class NesoiClient<
    Engine extends NesoiEngine<any,any,any,any>,
    AppClient extends Client
> {
    public data: NesoiDataClient<Engine>
    public task: NesoiTaskClient<Engine>
    public user: AppClient['user']

    constructor(
        protected engine: Engine,
        public app: AppClient,
    ) {
        this.data = new NesoiDataClient(engine, this)
        this.task = new NesoiTaskClient(engine, this)
        this.user = app.user
        Object.assign(this, app)
    }
}