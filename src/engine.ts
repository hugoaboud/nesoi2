import { $Event } from "./builders/event"
import { JobBuilder } from "./builders/job/job"
import { ResourceBuilder } from "./builders/resource/resource"
import { EventParserBuilder } from "./builders/parser/event_parser"
import { NesoiModel, ResourceModel } from "./engine/data/model"
import { DataSource } from "./engine/data/datasource"
import { Queue, QueueSource } from "./engine/queue"
import { MemoryQueueSource } from "./engine/queue/memory.queue"
import { MemoryCacheSource } from "./engine/cache/memory.cache"
import { Cache, CacheSource } from "./engine/cache"
import { TaskBuilder, TaskSource } from "./builders/operation/task"
import { Task } from "./engine/operation/task"
import { NesoiClient } from "./client"

type Client = {
    user: {
        id: number | string
    }
}

type EngineClient<
    AppClient extends Client,
    TaskNameUnion extends string,
    SourceNameUnion extends string,
    Sources extends Record<SourceNameUnion, typeof DataSource<any>>,
> = NesoiClient<
    NesoiEngine<
        AppClient,
        TaskNameUnion,
        SourceNameUnion,
        Sources
    >,
    AppClient
>

export class NesoiEngine<
    AppClient extends Client,
    TaskNameUnion extends string,
    SourceNameUnion extends string,
    Sources extends Record<SourceNameUnion, typeof DataSource<any>>,
    C extends NesoiClient<any,any> = EngineClient<AppClient, TaskNameUnion, SourceNameUnion, Sources>
> {
    protected queue: Queue
    protected cache: Cache
    
    public sources: Sources = {} as any
    public tasks: Record<TaskNameUnion, Task<any, any>> = {} as any

    constructor($: {
        $client: AppClient,
        queue?: QueueSource,
        cache?: CacheSource,
        sources?: Sources,
        tasks?: TaskNameUnion[]
    }) {
        this.queue = new Queue($?.queue || new MemoryQueueSource())
        this.cache = new Cache($?.cache || new MemoryCacheSource())
        this.sources = $.sources as any
        this.tasks = $.tasks as any
    }

    resource<
        Model extends ResourceModel
    >(
        name: string,
        dataSourceClass: new (...args: any) => DataSource<Model>
    ) {
        return new ResourceBuilder(this, name, dataSourceClass);
    }

    job<
        Event extends EventParserBuilder
    >(
        name: string,
        $: $Event<Event>
    ) {
        return new JobBuilder(name, $);
    }

    task<
        Source extends TaskSource<any,any,any>
    >(
        name: TaskNameUnion,
        dataSource: Source
    ) {
        return new TaskBuilder<C, Source>(name, dataSource, task => {
            this.tasks[name] = task
        })
    }

    client (client: AppClient): C {
        return new NesoiClient(this as any, client) as any
    }

}