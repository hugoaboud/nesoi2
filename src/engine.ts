import { $Event, EventBuilder } from "./builders/event"
import { JobBuilder } from "./builders/job/job"
import { ResourceBuilder } from "./builders/resource/resource"
import { EventParserBuilder } from "./builders/parser/event_parser"
import { NesoiObj, ResourceObj } from "./engine/data/model"
import { Bucket, BucketAdapter } from "./engine/data/bucket"
import { Queue, QueueSource } from "./engine/queue"
import { MemoryQueueSource } from "./engine/queue/memory.queue"
import { MemoryCacheSource } from "./engine/cache/memory.cache"
import { Cache, CacheSource } from "./engine/cache"
import { TaskBuilder, TaskSource } from "./builders/operation/task"
import { Task } from "./engine/operation/task"
import { Client, NesoiClient } from "./client"
import { NesoiStrings } from "./strings"
import { BucketBuilder } from "./builders/data/bucket"

type EngineClient<
    AppClient extends Client,
    TaskNameUnion extends string,
    SourceNameUnion extends string,
    Buckets extends Record<SourceNameUnion, Bucket<any>>,
> = NesoiClient<
    NesoiEngine<
        AppClient,
        TaskNameUnion,
        SourceNameUnion,
        Buckets
    >,
    AppClient
>

export class NesoiEngine<
    AppClient extends Client,
    TaskNameUnion extends string,
    SourceNameUnion extends string,
    Buckets extends Record<SourceNameUnion, Bucket<any>>,
    C extends NesoiClient<any,any> = EngineClient<AppClient, TaskNameUnion, SourceNameUnion, Buckets>
> {
    protected queue: Queue
    protected cache: Cache
    
    public buckets: Buckets = {} as any
    public tasks: Record<TaskNameUnion, Task<any, any>> = {} as any
    public strings: NesoiStrings

    constructor($: {
        $client: AppClient,
        queue?: QueueSource,
        cache?: CacheSource,
        buckets?: Buckets,
        tasks?: TaskNameUnion[],
        strings?: Partial<NesoiStrings>
    }) {
        this.queue = new Queue($?.queue || new MemoryQueueSource())
        this.cache = new Cache($?.cache || new MemoryCacheSource())
        this.buckets = $.buckets as any
        this.strings = Object.assign(NesoiStrings, $.strings || {})
    }

    event(
        name: string,
    ) {
        return new EventBuilder(this, name);
    }

    bucket<
        Adapter extends new (...args: any) => BucketAdapter<any, any>,
    >(
        name: string,
        adapter: Adapter
    ) {
        // return new BucketBuilder(this, adapter, bucket => {
        //     (this.buckets as any)[name] = bucket
        // })
    }

    resource<
        Model extends ResourceObj
    >(
        name: string,
        bucket: Bucket<Model>
    ) {
        return new ResourceBuilder(this, name, bucket);
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
    ): TaskBuilder<C, Source> {
        return new TaskBuilder<C, Source>(this, name, dataSource, task => {
            this.tasks[name] = task
        })
    }

    client (client: AppClient): C {
        return new NesoiClient(this as any, client) as any
    }

    string(key: keyof NesoiStrings) {
        return this.strings[key];
    }
}

export type AnyEngine = NesoiEngine<any, any, any, any>