import { DataSource } from "./data/datasource";
import { ResourceModel } from "./data/model";
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

    async readOne<V extends keyof Views>(
        id: Model['id'],
        view: V|'raw' = 'raw'
    ) {
        // 1. Read from Data Source
        const promise = this.dataSource.get({} as any, id);
        const model = await Promise.resolve(promise)
        if (!model) {
            throw NesoiError.Resource.NotFound(this.name, id)
        }
        // 2. If raw view, build a Obj from the model
        if (view === 'raw') {
            return this.build<Model>(model, model)
        }
        // 3. If not, build a Obj from the view result
        const viewSchema = this.views[view || 'default']
        const parsedView = await viewSchema.parse(model)
        return this.build<ViewObj<Views[V]>>(model, parsedView)
    }

    async readAll<V extends keyof Views>(
        id: Model['id'],
        view: V|'raw' = 'raw'
    ) {
        // 1. Read from Data Source
        const promise = this.dataSource.index({} as any);
        const models = await Promise.resolve(promise)
        // 2. If raw view, build a list of Objs from the model list
        if (view === 'raw') {
            return Promise.all(models.map(model =>
                this.build<Model>(model, model)
            ))
        }
        // 3. If not, build a list of Objs from the view results
        const v = this.views[view || 'default']
        const parsedViews = await Promise.all(
            models.map(model => v.parse(model))
        )
        return Promise.all(parsedViews.map((view, i) => 
            this.build<Views[V]>(models[i], view)
        ))
    }

    private build<T>(model: Obj, view: Obj) {
        return new ResourceObj(
            this as any,
            model as any,
            view as any
        ) as any as ResourceModel & T
    }

}

type ViewObj<
    V extends View<any>,
    R = ReturnType<V['parse']>
> = R extends { then: any } ? Awaited<R> : R