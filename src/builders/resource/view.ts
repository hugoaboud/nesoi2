/**
 * [ View ]
 * 
 * A schema for parsing a resource into an object.
 * 
*/

import { ResourceModel } from "../../data/model"

type ViewProp = {
    __type: 'view_prop'
    source: 'model'|'compose'|'graph'|'computed'
    amount: 'one'|'many'
    fn: (...args: any) => any
}

export type ViewSchema = {
    [_: string]: ViewProp | ViewSchema
}

export class ViewPropFactory<
    Model extends ResourceModel
> {
    
    model(prop: keyof Model): ViewProp {
        return {
            __type: 'view_prop',
            source: 'model',
            amount: 'one',
            fn: (obj: Model) => obj[prop]
        }
    }

    compose(compose: string): ViewProp {
        return {
            __type: 'view_prop',
            source: 'compose',
            amount: 'one',
            fn: () => {}
        }
    }

    child(name: string): ViewProp {
        return {
            __type: 'view_prop',
            source: 'graph',
            amount: 'one',
            fn: () => {}
        }
    }

    children(name: string): ViewProp {
        return {
            __type: 'view_prop',
            source: 'graph',
            amount: 'many',
            fn: () => {}
        }
    }

}

export type $View<
    Model extends ResourceModel,
    Tree extends ViewSchema
> = ($: ViewPropFactory<Model>) => Tree
