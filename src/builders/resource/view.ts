/**
 * [ View ]
 * 
 * A schema for parsing a resource into an object.
 * 
*/

import { Bucket } from "../../engine/data/bucket"
import { ResourceObj } from "../../engine/data/model"

export type ViewProp<T> = {
    __type: 'view.prop'
    type: 'model'|'computed'|'compose'|'graph'
    amount: 'one'|'many'
    fn: (model: ResourceObj) => T | Promise<T>
}

export type ViewBuilder = {
    [_: string]: ViewProp<any> | ViewBuilder
}

export type ViewTypeFromBuilder<
    View extends ViewBuilder
> = {
    [K in keyof View]: View[K] extends ViewProp<infer X>
        ? X
        : View[K] extends ViewBuilder
            ? ViewTypeFromBuilder<View[K]>
            : never
}

export class ViewPropFactory<
    Model extends ResourceObj
> {
    
    model<K extends keyof Model>(prop: K): ViewProp<Model[K]> {
        return {
            __type: 'view.prop',
            type: 'model',
            amount: 'one',
            fn: (obj: any) => obj[prop]
        }
    }
    
    computed<T>(fn: (model: Model) => T | Promise<T>): ViewProp<T> {
        return {
            __type: 'view.prop',
            type: 'computed',
            amount: 'one',
            fn: fn as any
        }
    }

    oneOf(resource: string) {
        return {
            from: (self_fkey?: string) => ({
                __type: 'view.prop',
                type: 'graph',
                amount: 'one',
                fn: () => ({} as never)
            } as ViewProp<never>),
            where: (other_fkey?: string) => ({
                __type: 'view.prop',
                type: 'graph',
                amount: 'one',
                fn: () => ({} as never)
            } as ViewProp<never>)
        }
    }

    manyOf(name: string) {
        return {
            where: (other_fkey?: string) => ({
                __type: 'view.prop',
                type: 'graph',
                amount: 'many',
                fn: () => ({} as never)
            } as ViewProp<never>),
            pivot: (source: typeof Bucket<any>, self_fkey: string, other_fkey: string) => ({
                __type: 'view.prop',
                type: 'graph',
                amount: 'many',
                fn: () => ({} as never)
            } as ViewProp<never>)
        }
    }

}

export type $View<
    Model extends ResourceObj,
    Tree extends ViewBuilder
> = ($: ViewPropFactory<Model>) => Tree
