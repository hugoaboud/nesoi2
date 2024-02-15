import { AnyEngine } from "../../engine"
import { Bucket, BucketAdapter } from "../../engine/data/bucket"
import { NesoiObj } from "../../engine/data/model"
import { AnyView, View } from "../../engine/data/view"
import { UnionToIntersection } from "../../helpers/type"
import { ViewPropFactory, ViewSchema } from "./view"

/* Builder */

export class BucketBuilder<
    Adapter extends new (...args: any) => BucketAdapter<any, any>,
    Obj extends NesoiObj = InstanceType<Adapter> extends BucketAdapter<infer X, any> ? X : never,
    Views extends Record<string, AnyView> = {}
> {

    private data = {} as Record<any, any>
    private meta = {} as Record<any, any>
    private views = {} as Views

    constructor(
        private adapter: Adapter,
        private onBuild?: (bucket: Bucket<Obj, Views>) => void
    ) {

    }

    view<
        Name extends string,
        Schema extends ViewSchema
    >(
        name: Name,
        $: ($: ViewPropFactory<NesoiObj & UnionToIntersection<Obj>>) => Schema
    ) {
        const view = new View($);
        (this.views as any)[name] = view;
        return this as any as BucketBuilder<
            Adapter,
            Obj,
            Views & {
                [K in Name]: typeof view
            }
        >
    }

    build(...adapterConstructorArgs: ConstructorParameters<Adapter>) {
        const adapter = new this.adapter(...adapterConstructorArgs as any);
        const bucket = new Bucket<Obj, Views>(adapter, this.views)
        if (this.onBuild) {
            this.onBuild(bucket)
        }
        return bucket
    }

}
