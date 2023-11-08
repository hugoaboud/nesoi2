import { $Event } from "./builders/event"
import { JobBuilder } from "./builders/job/job"
import { ResourceBuilder } from "./builders/resource/resource"
import { EventParserSchema } from "./builders/parser/event_parser"
import { ResourceModel } from "./data/model"
import { DataSource } from "./data/data_source"

type Client = {
    user: {
        id: number | string
    }
}

export class NesoiEngine<
    AppClient extends Client
> {
    private client!: AppClient

    resource<
        Model extends ResourceModel
    >(
        name: string,
        dataSourceClass: new (...args: any) => DataSource<Model>
    ) {
        return new ResourceBuilder(name, dataSourceClass);
    }

    job<
        Event extends EventParserSchema
    >(
        name: string,
        $: $Event<Event>
    ) {
        return new JobBuilder(name, $);
    }
}