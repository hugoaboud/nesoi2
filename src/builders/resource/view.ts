/**
 * [ View ]
 * 
 * A schema for parsing a resource into an object.
 * 
*/

import { ResourceModel } from "../../model"

type ViewProp = {
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
            source: 'model',
            amount: 'one',
            fn: (obj: Model) => obj[prop]
        }
    }

    compose(compose: string): ViewProp {
        return {
            source: 'compose',
            amount: 'one',
            fn: () => {}
        }
    }

    child(name: string): ViewProp {
        return {
            source: 'graph',
            amount: 'one',
            fn: () => {}
        }
    }

    children(name: string): ViewProp {
        return {
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
