import { ViewProp, ViewSchema, ViewTypeFromSchema } from "../builders/resource/view";
import { ResourceModel } from "../data/model";

export class View<
    Schema extends ViewSchema,
    Type = ViewTypeFromSchema<Schema>
> {

    constructor(
        protected schema: Schema
    ) {}

    async parse(model: ResourceModel): Promise<Type> {
        const parsedObj = {} as any
        // Model props
        for (const k in this.schema) {
            const prop = this.schema[k];
            if (prop.__type === 'view.prop') {
                if (prop.type !== 'model') { continue }
                parsedObj[k] = (prop as ViewProp<any>).fn(model)
            }
            else {
                parsedObj[k] = this.parse(model);
            }
            parsedObj[k] = await Promise.resolve(parsedObj[k])
        }
        
        // Computed props
        for (const k in this.schema) {
            const prop = this.schema[k];
            if (prop.__type === 'view.prop') {
                if (prop.type !== 'computed') { continue }
                parsedObj[k] = (prop as ViewProp<any>).fn(model)
            }
            else {
                parsedObj[k] = this.parse(model);
            }
            parsedObj[k] = await Promise.resolve(parsedObj[k])
        }
        return parsedObj
    }

}