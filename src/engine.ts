import { $Event } from "./builders/event"
import { JobBuilder } from "./builders/job/job"
import { ResourceBuilder } from "./builders/resource/resource"
import { EventParserBuilder } from "./builders/parser/event_parser"
import { ResourceModel } from "./data/model"
import { DataSource } from "./data/data_source"
import { Queue, QueueSource } from "./engine/queue"
import { MemoryQueueSource } from "./engine/queue/memory.queue"
import { MemoryCacheSource } from "./engine/cache/memory.cache"
import { Cache, CacheSource } from "./engine/cache"

type Client = {
    user: {
        id: number | string
    }
}

export class NesoiEngine<
    AppClient extends Client
> {
    private client!: AppClient
    private queue: Queue
    private cache: Cache

    constructor(sources = {
        queue: new MemoryQueueSource() as QueueSource,
        cache: new MemoryCacheSource() as CacheSource
    }) {
        this.queue = new Queue(sources.queue)
        this.cache = new Cache(sources.cache)
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
}