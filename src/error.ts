import { EventParserPropBuilder, EventParserRule } from "./builders/parser/event_parser";

export namespace NesoiError {

    export namespace Event {
        
        export function Sanitize(message: string) {
            return new Error(message)
        }

        export function Required(prop: any) {
            return new Error(`${prop.alias} is required`)
        }

        export function Parse(prop: any, type: string) {
            return new Error(`${prop.alias} is not ${type}`)
        }

        export function Rule(rule: EventParserRule<any>, prop: EventParserPropBuilder<any>) {
            return new Error(rule.error(prop))
        }

    }

}