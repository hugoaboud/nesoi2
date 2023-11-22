import { EventParserProp, EventParserRule } from "./builders/parser/event_parser";

export namespace NesoiError {

    export namespace Event {
        
        export function Sanitize(message: string) {
            return new Error(message)
        }

        export function Required(prop: EventParserProp<any>) {
            return new Error(`${prop.alias} is required`)
        }

        export function Parse(prop: EventParserProp<any>, type: string) {
            return new Error(`${prop.alias} is not ${type}`)
        }

        export function Rule(rule: EventParserRule<any>, prop: EventParserProp<any>) {
            return new Error(rule.error(prop))
        }

    }

}