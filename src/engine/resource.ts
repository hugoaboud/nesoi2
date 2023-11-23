import { EventParserBuilder } from "../builders/parser/event_parser";
import { ResourceBuilder } from "../builders/resource/resource";
import { ViewBuilder } from "../builders/resource/view";
import { DataSource } from "../data/data_source";
import { ResourceModel } from "../data/model";
import { View } from "./view";

export class Resource<
    Model extends ResourceModel,
    Views extends Record<string, View<any>>
> {

    protected alias: string
    protected events: EventParserBuilder
    protected views: Views

    protected dataSource: DataSource<any>

    constructor(builder: any) {
        this.alias = builder._alias
        this.events = builder._events
        this.dataSource = new builder.dataSourceClass()

        this.views = {} as Views
        for (const v in builder._views) {
            (this.views as any)[v] = new View(builder._views[v]);
        }
    }

    async readOne(id: Model['id'], view?: keyof Views) {
        const res = this.dataSource.get(id);
        const model = await Promise.resolve(res)
        if (!view && !('default' in this.views)) {
            return {}
        }
        const v = this.views[view || 'default']
        return v.parse(model)
    }

}