/**
 * [ View ]
 * 
 * A schema for parsing a resource into an object.
 * 
*/

import { ResourceModel } from "../../data/model"

export type ViewProp<T> = {
    __type: 'view.prop'
    type: 'model'|'computed'|'compose'|'graph'
    amount: 'one'|'many'
    fn: (model: ResourceModel) => T | Promise<T>
}

export type ViewSchema = {
    [_: string]: ViewProp<any> | ViewSchema
}

export type ViewTypeFromSchema<
    Schema extends ViewSchema
> = {
    [K in keyof Schema]: Schema[K] extends ViewProp<infer X>
        ? X
        : Schema[K] extends ViewSchema
            ? ViewTypeFromSchema<Schema[K]>
            : never
}

export class ViewPropFactory<
    Model extends ResourceModel
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

    compose(compose: string): ViewProp<never> {
        return {
            __type: 'view.prop',
            type: 'compose',
            amount: 'one',
            fn: () => ({} as never)
        }
    }

    child(name: string): ViewProp<never> {
        return {
            __type: 'view.prop',
            type: 'graph',
            amount: 'one',
            fn: () => ({} as never)
        }
    }

    children(name: string): ViewProp<never> {
        return {
            __type: 'view.prop',
            type: 'graph',
            amount: 'many',
            fn: () => ({} as never)
        }
    }

}

export type $View<
    Model extends ResourceModel,
    Tree extends ViewSchema
> = ($: ViewPropFactory<Model>) => Tree
