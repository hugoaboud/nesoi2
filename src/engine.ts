import { $Event } from "./builders/event"
import { JobBuilder } from "./builders/job/job"
import { ResourceBuilder } from "./builders/resource/resource"
import { EventParserSchema } from "./builders/parser/event_parser"
import { ResourceModel } from "./model"

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
        model: new (...args: any) => Model
    ) {
        return new ResourceBuilder(name, model);
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