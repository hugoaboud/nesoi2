/**
 * [ EventParser ]
 * 
 * A schema for validating events.
 * 
*/

import { NesoiClient } from "../../client"
import { NesoiDate } from "../../engine/date"
import { NesoiError } from "../../error"

type EventParseMethodOutput<O> = Record<string, O>
export type EventParseMethod<I, O> = (client: NesoiClient<any, any>, prop: EventParserPropBuilder<I, O>, propName: string, value: any) => EventParseMethodOutput<O> | Promise<EventParseMethodOutput<O>> 

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
    private isArray = false
    
    constructor(
        private alias: string,
        private method: EventParseMethod<I, O>
    ) {}

    optional(defaultValue?: O) {
        this.required = false;
        this.default = defaultValue;
        return this as any as EventParserPropBuilder<I|undefined, O|undefined>;
    }

    rule(rule: EventParserRule<I, O>) {
        this.rules.push(rule);
        return this;
    }

    array() {
        this.isArray = true;
        return this as any as EventParserPropBuilder<I[], O[]>;
    }

}

export function EventParserPropFactory(
    alias: string
) {
    return {

        boolean: new EventParserPropBuilder<boolean,boolean>(alias,
             (client, prop, propName, value) => {
                if (value === 'true') { return {
                    [propName]: true
                } }
                if (value === 'false') { return {
                    [propName]: false
                }}
                if (typeof value === 'boolean') { return {
                    [propName]: value
                } }
                throw NesoiError.Event.Parse(prop, 'a boolean')
            }),
    
        date: new EventParserPropBuilder<string, NesoiDate>(alias,
             (client, prop, propName, value) => {
                // TODO
                if (typeof value === 'string') {
                    return { 
                        [propName]: new NesoiDate(value)
                    }
                }
                throw NesoiError.Event.Parse(prop, 'a ISO date')
            }),
        
        datetime: new EventParserPropBuilder<string, NesoiDate>(alias,
             (client, prop, propName, value) => {
                // TODO
                if (typeof value === 'string') {
                    return {
                        [propName]: new NesoiDate(value)
                    }
                }
                throw NesoiError.Event.Parse(prop, 'a ISO datetime')
            }),
    
        enum<O extends string>(options: readonly O[]) {
            return new EventParserPropBuilder<O,O>(alias,
                 (client, prop, propName, value) => {
                    if (
                        typeof value === 'string' &&
                        options.includes(value as any)
                    ) {
                        return {
                            [propName]: value as O
                        }
                    }
                    throw NesoiError.Event.Parse(prop, `a valid option. Options: ${options}`)
                })
        },
    
        file(options?: {
            maxSize?: number
            extnames?: string[]
        }) {
            return new EventParserPropBuilder(alias,
                 (client, prop, propName, value) => {
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
                    return {
                        [propName]: value
                    }
                })
        },
        
        float: new EventParserPropBuilder<number,number>(alias,
             (client, prop, propName, value) => {
                if (typeof value === 'string') {
                    const val = parseFloat(value);
                    if (!Number.isNaN(val)) {
                        return {
                            [propName]: val
                        }
                    }
                }
                else if (typeof value === 'number') {
                    return {
                        [propName]: value
                    }
                }
                throw NesoiError.Event.Parse(prop, 'a float number')
            }),
    
        id(source: string) {
            return new EventParserPropBuilder<number|string,number|string>(alias,
                // TODO
                 async (client, prop, propName, value) => {
                    const val = (typeof value === 'string') ? parseInt(value) : value
                    if (Number.isNaN(val) || typeof value !== 'number') {
                        throw NesoiError.Event.Parse(prop, 'a ID')
                    }
                    const propObjName = propName.replace(/_ids?$/, '')
                    return {
                        [propName]: val,
                        [propObjName]: await client.data.readOneOrFail(source, val)
                    }
                })
        },
    
        int: new EventParserPropBuilder<number,number>(alias,
             (client, prop, propName, value) => {
                if (typeof value === 'string') {
                    const val = parseInt(value);
                    if (!Number.isNaN(val)) {
                        return {
                            [propName]: val
                        }
                    }
                }
                else if (typeof value === 'number') {
                    return {
                        [propName]: value
                    }
                }
                throw NesoiError.Event.Parse(prop, 'a integer number')
            }),
    
        string: new EventParserPropBuilder<string,string>(alias,
             (client, prop, propName, value) => {
                if (typeof value === 'string') {
                    return {
                        [propName]: value
                    }
                }
                throw NesoiError.Event.Parse(prop, 'a string')
            }),

    }

}

export type $EventParser<Parser extends EventParserBuilder> = ($: typeof EventParserPropFactory) => Parser