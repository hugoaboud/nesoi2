/**
 * [ EventParser ]
 * 
 * A schema for validating events.
 * 
*/

import { NesoiDate } from "../../engine/date"
import { NesoiError } from "../../error"

export type EventParseMethod<I, O> = (prop: EventParserPropBuilder<I, O>, value: any) => O | Promise<O>

export type EventParserRule<I, O> = {
    cond: (value: O) => boolean | Promise<boolean>,
    error: (prop: EventParserPropBuilder<I, O>) => string
}

export type EventParserBuilder = {
    [_: string]: EventParserPropBuilder<any, any> | EventParserBuilder
}

export type EventInputFromParser<
    Parser extends EventParserBuilder
> = {
    [K in keyof Parser]: Parser[K] extends EventParserPropBuilder<infer X, any>
        ? X
        : Parser[K] extends EventParserBuilder
            ? EventInputFromParser<Parser[K]>
            : never
}

export type EventOutputFromParser<
    Parser extends EventParserBuilder
> = {
    [K in keyof Parser]: Parser[K] extends EventParserPropBuilder<any, infer X>
        ? X
        : Parser[K] extends EventParserBuilder
            ? EventInputFromParser<Parser[K]>
            : never
}

export class EventParserPropBuilder<I, O> {

    private __type = 'event.prop';
    private required = true
    private default?: O = undefined
    private rules: EventParserRule<I, O>[] = []
    
    constructor(
        private alias: string,
        private method: EventParseMethod<I, O>
    ) {}

    optional(defaultValue?: O) {
        this.required = false;
        this.default = defaultValue;
        return this as any as EventParserPropBuilder<I, O|undefined>;
    }

    rule(rule: EventParserRule<I, O>) {
        this.rules.push(rule);
        return this;
    }

}

export function EventParserPropFactory(
    alias: string
) {
    return {

        boolean: new EventParserPropBuilder<boolean,boolean>(alias,
            (prop, value) => {
                if (value === 'true') { return true; }
                if (value === 'false') { return false; }
                if (typeof value === 'boolean') { return value }
                throw NesoiError.Event.Parse(prop, 'a boolean')
            }),
    
        date: new EventParserPropBuilder<string, NesoiDate>(alias,
            (prop, value) => {
                // TODO
                if (typeof value === 'string') {
                    return new NesoiDate(value)
                }
                throw NesoiError.Event.Parse(prop, 'a ISO date')
            }),
        
        datetime: new EventParserPropBuilder<string, NesoiDate>(alias,
            (prop, value) => {
                // TODO
                if (typeof value === 'string') {
                    return new NesoiDate(value)
                }
                throw NesoiError.Event.Parse(prop, 'a ISO datetime')
            }),
    
        enum<O extends string>(options: readonly O[]) {
            return new EventParserPropBuilder<O,O>(alias,
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
    
        file(options?: {
            maxSize?: number
            extnames?: string[]
        }) {
            return new EventParserPropBuilder(alias,
                (prop, value) => {
                    if (!value.size || !value.extname || !value.data || !value.data.clientName) {
                        throw NesoiError.Event.Parse(prop, 'a file')
                    }
                    if (options?.maxSize) {
                        if (value.size > options?.maxSize) {
                            throw NesoiError.Event.FileSize(prop, options?.maxSize)
                        }
                    }
                    if (options?.extnames) {
                        if (!options?.extnames.includes(value.extname)) {
                            throw NesoiError.Event.FileExtName(prop, options?.extnames)
                        }
                    }
                    return value
                })
        },
        
        float: new EventParserPropBuilder<number,number>(alias,
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
            return new EventParserPropBuilder<number|string,number|string>(alias,
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
    
        int: new EventParserPropBuilder<number,number>(alias,
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
    
        string: new EventParserPropBuilder<string,string>(alias,
            (prop, value) => {
                if (typeof value === 'string') {
                    return value
                }
                throw NesoiError.Event.Parse(prop, 'a string')
            }),

    }

}

export type $EventParser<Parser extends EventParserBuilder> = ($: typeof EventParserPropFactory) => Parser