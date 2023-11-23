import { EventParseMethod, EventParserRule, EventParserBuilder, EventTypeFromParser } from "../../builders/parser/event_parser"
import { NesoiError } from "../../error"
import { MakeUndefinedOptional } from "../../helpers/type"

type Prop = {
    __type: 'event.prop'
    alias: string
    required: boolean
    default?: any
    method: EventParseMethod<any>
    rules: EventParserRule<any>[]
}

type Schema = {
    [_: string]: Prop | Schema
}

export class EventParser<
    S extends EventParserBuilder,
    Type = EventTypeFromParser<S>
> {

    protected schema: Schema

    constructor(builder: any) {
        this.schema = builder._parser
    }

    async parse(event: MakeUndefinedOptional<Type>) {
        return this.parseSchema(this.schema, event) as Type
    }

    private async parseSchema(schema: Schema, obj: Record<string, any>) {
        const parsedObj = {} as any
        for (const k in schema) {
            const prop = schema[k]
            if (prop.__type === 'event.prop') {
                parsedObj[k] = await this.parseProp(prop as Prop, obj[k])
            }
            else {
                parsedObj[k] = await this.parseSchema(prop as Schema, obj[k])
            }
        }
        return parsedObj
    }

    private async parseProp(prop: Prop, value: any) {
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
        const method = prop.method(prop as any, value)
        const parsedValue = await Promise.resolve(method)

        // 4. Apply rules
        for (const r in prop.rules) {
            const rule = prop.rules[r]
            const cond = rule.cond(parsedValue)
            const res = await Promise.resolve(cond)
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