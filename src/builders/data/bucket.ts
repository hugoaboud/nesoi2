import { AnyEngine, NesoiEngine } from "../../engine"
import { Bucket, BucketAdapter } from "../../engine/data/bucket"
import { MemoryBucket } from "../../engine/data/memory.bucket"
import { NesoiObj } from "../../engine/data/model"
import { AnyView, View } from "../../engine/data/view"
import { UnionToIntersection } from "../../helpers/type"
import { $View, ViewPropFactory, ViewSchema } from "./view"

/* Builder */

export class BucketBuilder<
    Engine extends AnyEngine,
    Adapter extends new (...args: any) => BucketAdapter<any, any>,
    Obj extends NesoiObj = InstanceType<Adapter> extends BucketAdapter<infer X, any> ? X : never,
    Views extends Record<string, AnyView> = {}
> {

    data = {} as Record<any, any>
    meta = {} as Record<any, any>
    views = {} as Views

    constructor(
        public engine: Engine,
        private adapter: Adapter
    ) {

    }

    view<
        Name extends string,
        Schema extends ViewSchema
    >(
        name: Name,
        $: ($: ViewPropFactory<Engine, NesoiObj & UnionToIntersection<Obj>>) => Schema
    ) {
        const view = new View($);
        (this.views as any)[name] = view;
        return this as any as BucketBuilder<
            Engine,
            Adapter,
            Obj,
            Views & {
                [K in Name]: typeof view
            }
        >
    }
    
    build(...adapterConstructorArgs: ConstructorParameters<Adapter>) {
        const adapter = new this.adapter(...adapterConstructorArgs as any);
        return new Bucket<Obj, Views>(adapter, this.views)
    }

}
    
interface Fireball {
    id: string
    power: number
    red: number
}
    
interface Rasengan {
    id: string
    power: number
    blue: number
}

const nesoi = {
    bucket: <
        Adapter extends new (...args: any) => BucketAdapter<any, any>,
    >(name: string, adapter: Adapter) => {
        return new BucketBuilder({} as any, adapter)
    }
}

function a<T>() {
    type Papel = {
        [K in keyof T]: T[K]
    }
    return {} as Papel
}

const t = a<{ oi: 'bacanudo' }>()


const MyBucket = nesoi.bucket('fireball', MemoryBucket<Fireball|Rasengan>)
    .view('default', $ => ({
        lala: $.model('power')
    }))
    .view('color', $ => ({
        value: $.computed(obj => obj.red || obj.blue)
    }))
    .build() 

async function main() {

    const objs = await MyBucket.index({} as any, 'default')
    
    const obj = await MyBucket.get({} as any, 'oi')
    const obj2 = await MyBucket.get({} as any, 'oi', 'color')
    const obj3 = await MyBucket.get({} as any, 'oi', 'default')
    
    console.log(MyBucket);
    console.log(objs);
    console.log(obj);
    console.log(obj2);
    console.log(obj3);
}
main()