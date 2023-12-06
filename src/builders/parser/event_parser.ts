/**
 * [ EventParser ]
 * 
 * A schema for validating events.
 * 
*/

import { NesoiError } from "../../error"

export type EventParseMethod<T> = (prop: EventParserPropBuilder<T>, value: any) => T | Promise<T>

export type EventParserRule<T> = {
    cond: (value: T) => boolean | Promise<boolean>,
    error: (prop: EventParserPropBuilder<T>) => string
}

export type EventParserBuilder = {
    [_: string]: EventParserPropBuilder<any> | EventParserBuilder
}

export type EventTypeFromParser<
    Parser extends EventParserBuilder
> = {
    [K in keyof Parser]: Parser[K] extends EventParserPropBuilder<infer X>
        ? X
        : Parser[K] extends EventParserBuilder
            ? EventTypeFromParser<Parser[K]>
            : never
}

export class EventParserPropBuilder<T> {

    private __type = 'event.prop';
    private required = true
    private default?: T = undefined
    private rules: EventParserRule<T>[] = []
    
    constructor(
        private alias: string,
        private method: EventParseMethod<T>
    ) {}

    optional(defaultValue?: T) {
        this.required = false;
        this.default = defaultValue;
        return this as any as EventParserPropBuilder<T|undefined>;
    }

    rule(rule: EventParserRule<T>) {
        this.rules.push(rule);
        return this;
    }

}

export function EventParserPropFactory(
    alias: string
) {
    return {

        boolean: new EventParserPropBuilder<boolean>(alias,
            (prop, value) => {
                if (value === 'true') { return true; }
                if (value === 'false') { return false; }
                if (typeof value === 'boolean') { return value }
                throw NesoiError.Event.Parse(prop, 'a boolean')
            }),
    
        date: new EventParserPropBuilder<string>(alias,
            (prop, value) => {
                // TODO
                if (typeof value === 'string') {
                    return value
                }
                throw NesoiError.Event.Parse(prop, 'a ISO date')
            }),
        
        datetime: new EventParserPropBuilder<string>(alias,
            (prop, value) => {
                // TODO
                if (typeof value === 'string') {
                    return value
                }
                throw NesoiError.Event.Parse(prop, 'a ISO datetime')
            }),
    
        enum<O extends string>(options: readonly O[]) {
            return new EventParserPropBuilder<O>(alias,
                (prop, value) => {
                    if (
                        typeof value === 'string' &&
                        options.includes(value as any)
                    ) {
                        return value as O
                    }
                    throw NesoiError.Event.Parse(prop, `a valid option. Options: ${options}`)
                })
        },
    
        file() {
            return new EventParserPropBuilder(alias,
                (prop, value) => {
                    // TODO
                    if (typeof value === 'string') {
                        return value
                    }
                    throw NesoiError.Event.Parse(prop, 'a file')
                })
        },
        
        float: new EventParserPropBuilder<number>(alias,
            (prop, value) => {
                if (typeof value === 'string') {
                    const val = parseFloat(value);
                    if (!Number.isNaN(val)) {
                        return val
                    }
                }
                else if (typeof value === 'number') {
                    return value
                }
                throw NesoiError.Event.Parse(prop, 'a float number')
            }),
    
        id() {
            return new EventParserPropBuilder<number|string>(alias,
                // TODO
                (prop, value) => {
                    if (typeof value === 'string') {
                        return value
                    }
                    else if (typeof value === 'number') {
                        return value
                    }
                    throw NesoiError.Event.Parse(prop, 'a ID')
                })
        },
    
        int: new EventParserPropBuilder<number>(alias,
            (prop, value) => {
                if (typeof value === 'string') {
                    const val = parseInt(value);
                    if (!Number.isNaN(val)) {
                        return val
                    }
                }
                else if (typeof value === 'number') {
                    return value
                }
                throw NesoiError.Event.Parse(prop, 'a integer number')
            }),
    
        string: new EventParserPropBuilder<string>(alias,
            (prop, value) => {
                if (typeof value === 'string') {
                    return value
                }
                throw NesoiError.Event.Parse(prop, 'a string')
            }),

    }

}

export type $EventParser<Parser extends EventParserBuilder> = ($: typeof EventParserPropFactory) => Parser