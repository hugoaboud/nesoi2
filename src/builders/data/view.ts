import { AnyEngine, NesoiEngine } from "../../engine"
import { Bucket } from "../../engine/data/bucket"
import { MemoryBucket } from "../../engine/data/memory.bucket"
import { NesoiObj } from "../../engine/data/model"
import { View } from "../../engine/data/view"

/* Types */

export type ViewProp<Obj, T> = {
    __t: 'view.prop',
    type: 'model'|'computed'|'compose'|'graph'
    amount: 'one'|'many'
    fn: (model: Obj) => T | Promise<T>
}

export type ViewSchema = {
    [_: string]: ViewProp<any, any> | ViewSchema
}

/* Builder */

export class ViewPropFactory<
    Engine extends AnyEngine,
    Obj
> {
    
    model<
        K extends keyof Obj
    >(prop: K) {
        type _<T> = { [K in keyof ViewProp<Obj, T>]: ViewProp<Obj, T>[K] }
        return {
            __t: 'view.prop',
            type: 'model',
            amount: 'one',
            fn: obj => obj[prop]
        } as _<Obj[K]>
    }
    
    computed<Output>(fn: (model: Obj) => Output | Promise<Output>) {
        type _<T> = { [K in keyof ViewProp<Obj, T>]: ViewProp<Obj, T>[K] }
        return {
            __t: 'view.prop',
            type: 'computed',
            amount: 'one',
            fn: fn as any
        } as _<Output>
    }

    oneOf(resource: keyof Engine['sources']) {
        return {
            from: (self_fkey?: string) => ({
                __t: 'view.prop',
                type: 'graph',
                amount: 'one',
                fn: () => ({} as never)
            } as ViewProp<Obj, never>),
            where: (other_fkey?: string) => ({
                __t: 'view.prop',
                type: 'graph',
                amount: 'one',
                fn: () => ({} as never)
            } as ViewProp<Obj, never>)
        }
    }

    manyOf(name: keyof Engine['sources']) {
        return {
            where: (other_fkey?: string) => ({
                __t: 'view.prop',
                type: 'graph',
                amount: 'many',
                fn: () => ({} as never)
            } as ViewProp<Obj, never>),
            pivot: (source: typeof Bucket<any, any>, self_fkey: string, other_fkey: string) => ({
                __t: 'view.prop',
                type: 'graph',
                amount: 'many',
                fn: () => ({} as never)
            } as ViewProp<Obj, never>)
        }
    }

}

export type $View = <
    Engine extends AnyEngine,
    Obj extends NesoiObj,
    Schema extends ViewSchema
>(
    name: string,
    $: ($: ViewPropFactory<Engine, Obj>) => Schema
) => View<Engine, Obj, Schema>
