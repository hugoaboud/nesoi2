import { ViewBuilder, ViewTypeFromBuilder } from "../builders/resource/view";
import { DataSource } from "../data/data_source";
import { ResourceModel } from "../data/model";
import { NesoiError } from "../error";
import { ResourceObj } from "./resource/resource_obj";
import { StateMachine } from "./resource/state_machine";
import { View } from "./resource/view";

type Obj = Record<string, any>

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

    async readOne<V extends keyof Views>(id: Model['id'], view?: V) {
        const promise = this.dataSource.get(id);
        const model = await Promise.resolve(promise)
        if (!model) {
            throw NesoiError.Resource.NotFound(this.name, id)
        }
        if (!view && !('default' in this.views)) {
            throw NesoiError.Resource.NoDefaultView(this.name)
        }
        const viewSchema = this.views[view || 'default']
        const parsedView = await viewSchema.parse(model)
        return this.build<Views[V]>(model, parsedView)
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

    private build<V extends View<any>>(model: Obj, view: Obj) {
        return new ResourceObj(this.dataSource, model, view as any) as any as ResourceObj & ViewObj<V>
    }

}

type ViewObj<
    V extends View<any>,
    R = ReturnType<V['parse']>
> = R extends { then: any } ? Awaited<R> : R