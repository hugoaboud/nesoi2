import { EventParseMethod, EventParserRule, EventParserBuilder, EventTypeFromParser } from "../../builders/parser/event_parser"
import { NesoiError } from "../../error"
import { MakeUndefinedOptional } from "../../helpers/type"
import { EventPropSchema, EventSchema } from "../schema"

export class EventParser<
    S extends EventParserBuilder,
    Type = EventTypeFromParser<S>
> {

    constructor(
        public alias: string,
        public schema: EventSchema
    ) {}

    async parse(event: MakeUndefinedOptional<Type>) {
        return this.parseSchema(this.schema, event) as Type
    }

    private async parseSchema(schema: EventSchema, obj: Record<string, any>) {
        const parsedObj = {} as any
        for (const k in schema) {
            const prop = schema[k]
            if (prop.__type === 'event.prop') {
                parsedObj[k] = await this.parseProp(prop as EventPropSchema, obj[k])
            }
            else {
                parsedObj[k] = await this.parseSchema(prop as EventSchema, obj[k])
            }
        }
        return parsedObj
    }

    private async parseProp(prop: EventPropSchema, value: any) {
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
        // 3. Run parse method
        const promise = prop.method(prop as any, value)
        const parsedValue = await Promise.resolve(promise)

        // 4. Apply rules
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
        if (Array.isArray(value)) {
            return value.length === 0
        }
         if (typeof value === 'object') {
            return Object.keys(value).length === 0
        }
         if (typeof value === 'string') {
            return value.length === 0
        }
        return value === null ||
               value === undefined
    }

}