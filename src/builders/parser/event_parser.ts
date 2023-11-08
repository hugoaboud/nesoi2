/**
 * [ EventParser ]
 * 
 * A schema for validating events.
 * 
*/

type EventParserRule = (...args: any) => boolean

export type EventParserProp<T> = {
    __type: 'event_prop'
    alias: string
    required: boolean
    default?: T
    rules: EventParserRule[]
}

export type EventParserTree = {
    [_: string]: EventParserPropBuilder<any> | EventParserTree
}

export type EventParserSchema = {
    [_: string]: EventParserProp<any> | EventParserSchema
}

export type EventParserSchemaFromTree<
    Tree extends EventParserTree
> = {
    [K in keyof Tree]: Tree[K] extends EventParserPropBuilder<infer X>
        ? EventParserProp<X>
        : Tree[K] extends EventParserTree
            ? EventParserSchemaFromTree<Tree[K]>
            : never
}

class EventParserPropBuilder<T> {

    private __type = 'event_prop';
    private required = true
    private default?: T = undefined

    constructor(
        private alias: string,
        private rules: EventParserRule[]
    ) {}

    optional(defaultValue?: T) {
        this.required = false;
        this.default = defaultValue;
        return this;
    }

    rule(rule: EventParserRule) {
        this.rules.push(rule);
        return this;
    }

}

export function EventParserPropFactory(
    alias: string
) {
    return {

        boolean: new EventParserPropBuilder(alias, [
            () => true
        ]),
    
        date: new EventParserPropBuilder(alias, [
            () => true
        ]),
        
        datetime: new EventParserPropBuilder(alias, [
            () => true
        ]),
    
        enum() {
            return new EventParserPropBuilder(alias, [
                () => true
            ])
        },
    
        file() {
            return new EventParserPropBuilder(alias, [
                () => true
            ])
        },
        
        float: new EventParserPropBuilder(alias, [
            () => true
        ]),
    
        id() {
            return new EventParserPropBuilder(alias, [
                () => true
            ])
        },
    
        int: new EventParserPropBuilder(alias, [
            () => true
        ]),
    
        string: new EventParserPropBuilder(alias, [
            () => true
        ])

    }

}

export type $EventParser<Tree extends EventParserTree> = ($: typeof EventParserPropFactory) => Tree