import { $Event } from "./builders/event"
import { JobBuilder } from "./builders/job/job"
import { ResourceBuilder } from "./builders/resource/resource"
import { EventParserBuilder } from "./builders/parser/event_parser"
import { ResourceModel } from "./engine/data/model"
import { DataSource } from "./engine/data/datasource"
import { Queue, QueueSource } from "./engine/queue"
import { MemoryQueueSource } from "./engine/queue/memory.queue"
import { MemoryCacheSource } from "./engine/cache/memory.cache"
import { Cache, CacheSource } from "./engine/cache"
import { ActivityModel } from "./engine/operation/activity.model"
import { ActivityBuilder, ActivitySource } from "./builders/operation/activity"
import { Activity } from "./engine/operation/activity"
import { NesoiClient } from "./client"

type Client = {
    user: {
        id: number | string
    }
}

type EngineClient<
    AppClient extends Client,
    ActivityNameUnion extends string
> = NesoiClient<
    NesoiEngine<
        AppClient,
        ActivityNameUnion
    >,
    AppClient
>

export class NesoiEngine<
    AppClient extends Client,
    ActivityNameUnion extends string,
    C extends NesoiClient<any,any> = EngineClient<AppClient, ActivityNameUnion>
> {
    protected queue: Queue
    protected cache: Cache
    
    public activities: Record<ActivityNameUnion, Activity<any, any>> = {} as any

    constructor($: {
        client: AppClient,
        queue?: QueueSource,
        cache?: CacheSource,
        activities?: ActivityNameUnion[]
    }) {
        this.queue = new Queue($?.queue || new MemoryQueueSource())
        this.cache = new Cache($?.cache || new MemoryCacheSource())
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

    activity<
        Source extends ActivitySource<any,any,any>
    >(
        name: ActivityNameUnion,
        dataSource: Source
    ) {
        return new ActivityBuilder<C, Source>(name, dataSource, activity => {
            this.activities[name] = activity
        })
    }

    client (client: AppClient): C {
        return new NesoiClient(this as any, client) as any
    }

}