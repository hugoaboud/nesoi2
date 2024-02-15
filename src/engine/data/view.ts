import { ViewProp, ViewPropFactory, ViewSchema } from "../../builders/data/view"
import { AnyEngine, NesoiEngine } from "../../engine"
import { NesoiObj } from "./model"

type ViewOutput<
    Schema extends ViewSchema
> = {
    [K in keyof Schema]: Schema[K] extends ViewProp<any, infer X>
        ? X
        : Schema[K] extends ViewSchema
            ? ViewOutput<Schema[K]>
            : never
}

export class View<
    Obj extends NesoiObj,
    Schema extends ViewSchema = never,
    Output = ViewOutput<Schema>
> {
    public '#output' = {} as Output

    schema: Schema = {} as any

    constructor(
        $: ($: ViewPropFactory<Obj>) => Schema
    ) {
        const factory = new ViewPropFactory<Obj>()
        this.schema = $(factory)
    }

    async parse(raw: Obj): Promise<Output> {
        const parsedObj = {
            id: raw.id
        } as any
        // Model props
        for (const k in this.schema) {
            const prop = this.schema[k];
            if (prop.__t === 'view.prop') {
                if (prop.type !== 'model') { continue }
                parsedObj[k] = (prop as ViewProp<Obj, Output>).fn(raw)
            }
            else {
                parsedObj[k] = this.parse(raw);
            }
            parsedObj[k] = await Promise.resolve(parsedObj[k])
        }
        
        // Computed props
        for (const k in this.schema) {
            const prop = this.schema[k];
            if (prop.__t === 'view.prop') {
                if (prop.type !== 'computed') { continue }
                parsedObj[k] = (prop as ViewProp<Obj, Output>).fn(raw)
            }
            else {
                parsedObj[k] = this.parse(raw);
            }
            parsedObj[k] = await Promise.resolve(parsedObj[k])
        }
        
        // Computed props
        for (const k in this.schema) {
            const prop = this.schema[k];
            if (prop.__t === 'view.prop') {
                if (prop.type !== 'graph') { continue }
                parsedObj[k] = (prop as ViewProp<Obj, Output>).fn(raw)
            }
            else {
                parsedObj[k] = this.parse(raw);
            }
            parsedObj[k] = await Promise.resolve(parsedObj[k])
        }
        return parsedObj
    }
}

export type AnyView = View<any, any, any>