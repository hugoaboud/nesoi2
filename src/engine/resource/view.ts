import { ViewProp, ViewBuilder, ViewTypeFromBuilder } from "../../builders/resource/view";
import { ResourceObj } from "../data/model";

export class View<
    Builder extends ViewBuilder,
    Type = ViewTypeFromBuilder<Builder>
> {

    constructor(
        protected builder: Builder
    ) {}

    async parse(model: ResourceObj): Promise<Type> {
        const parsedObj = {} as any
        // Model props
        for (const k in this.builder) {
            const prop = this.builder[k];
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
        for (const k in this.builder) {
            const prop = this.builder[k];
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