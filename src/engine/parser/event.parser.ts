import { EventParseMethod, EventParserRule, EventParserBuilder, EventInputFromParser } from "../../builders/parser/event_parser"
import { NesoiClient } from "../../client"
import { NesoiError } from "../../error"
import { MakeUndefinedOptional } from "../../helpers/type"
import { EventPropSchema, EventSchema } from "../schema"

export class EventParser<
    S extends EventParserBuilder,
    Type = EventInputFromParser<S>
> {

    constructor(
        public alias: string,
        public schema: EventSchema
    ) {}

    async parse(client: NesoiClient<any, any>, event: MakeUndefinedOptional<Type>) {
        return this.parseSchema(client, this.schema, event) as Type
    }

    private async parseSchema(client: NesoiClient<any, any>, schema: EventSchema, obj: Record<string, any>) {
        const parsedObj = {} as any
        for (const k in schema) {
            const prop = schema[k]
            if (prop.__type === 'event.prop') {
                const propObj = await this.parseProp(client, prop as EventPropSchema, k, obj[k])
                Object.assign(parsedObj, propObj)
            }
            else {
                parsedObj[k] = await this.parseSchema(client, prop as EventSchema, obj[k])
            }
        }
        return parsedObj
    }

    private async parseProp(client: NesoiClient<any, any>, prop: EventPropSchema, propName: string, value: any) {
        // 1. Sanitize input
        this.sanitize(value);

        // 2. Check for required fields
        if (this.isEmpty(value)) {
            if (prop.required) {
                throw NesoiError.Event.Required(prop as any);
            }
            else {
                return undefined
            }
        }
        
        if (prop.isArray) {
            if (!Array.isArray(value)) {
                throw NesoiError.Event.Parse(prop as any, 'an array');
            }
        }

        // 3. Run parse method
        const promises = (prop.isArray ? value : [value])
            .map((item: any) => prop.method(client, prop as any, propName, item) )
        const parsedList = await Promise.all(promises)
        // const parsedValue = prop.isArray ? parsedList : parsedList[0]

        // 4. Parse list results
        let parsedValue = {} as any
        if (prop.isArray) {
            for (const i in parsedList) {
                for (const k in parsedList[i]) {
                    if (!(k in parsedValue)) {
                        parsedValue[k] = []
                    }
                    parsedValue[k].push(parsedList[i][k])
                }
            }
        } else {
            parsedValue = parsedList[0]
        }

        // 5. Apply rules
        for (const r in prop.rules) {
            const rule = prop.rules[r]
            const promise = rule.cond(parsedValue)
            const res = await Promise.resolve(promise)
            if (!res) {
                throw NesoiError.Event.Rule(rule, prop as any);
            }
        }

        return parsedValue;
    }
    
    private sanitize(value: any) {
        if (typeof value === 'function') {
            throw NesoiError.Event.Sanitize('Functions not allowed as event inputs. They can\'t be serialized.')
        }
    }
    
    private isEmpty(value: any) {
        // if (Array.isArray(value)) {
        //     return value.length === 0
        // }
        //  if (typeof value === 'object') {
        //     return Object.keys(value).length === 0
        // }
         if (typeof value === 'string') {
            return value.length === 0
        }
        return value === null ||
               value === undefined
    }

}