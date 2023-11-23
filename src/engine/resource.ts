import { DataSource } from "../data/data_source";
import { ResourceModel } from "../data/model";
import { NesoiError } from "../error";
import { StateMachine } from "./state_machine";
import { View } from "./view";

export class Resource<
    Model extends ResourceModel,
    Events,
    Views extends Record<string, View<any>>
> {

    protected name: string
    protected alias: string
    protected views: Views

    protected dataSource: DataSource<any>
    public machine: StateMachine<Model, Events>

    constructor(builder: any) {
        this.name = builder.name
        this.alias = builder._alias
        this.dataSource = new builder.dataSourceClass()

        this.views = {} as Views
        for (const v in builder._views) {
            (this.views as any)[v] = new View(builder._views[v]);
        }

        this.machine = new StateMachine(
            builder,
            this.dataSource
        )
    }

    async readOne(id: Model['id'], view?: keyof Views) {
        const promise = this.dataSource.get(id);
        const model = await Promise.resolve(promise)
        if (!view && !('default' in this.views)) {
            throw NesoiError.Resource.NoDefaultView(this.name)
        }
        const v = this.views[view || 'default']
        return v.parse(model)
    }

    async readAll(id: Model['id'], view?: keyof Views) {
        const promise = this.dataSource.index();
        const models = await Promise.resolve(promise)
        if (!view && !('default' in this.views)) {
            throw NesoiError.Resource.NoDefaultView(this.name)
        }
        const v = this.views[view || 'default']
        return Promise.all(
            models.map(model => v.parse(model))
        )
    }

}