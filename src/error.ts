import { EventParserPropBuilder, EventParserRule } from "./builders/parser/event_parser";

export namespace NesoiError {

    export function Condition(message: string) {
        return new Error(message)
    }
    

    export namespace Task {
        
        export function NotFound(name: string, id: number) {
            return new Error(`Task ${name} with id ${id} not found`)
        }
        
        export function InvalidState(name: string, id: number, state: string) {
            return new Error(`Task ${name} with id ${id} is at invalid state ${state}`)
        }
        
        export function InvalidStateExecute(name: string, state: string) {
            return new Error(`Execute task ${name} reached invalid state ${state}`)
        }

    }

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

    export namespace Resource {

        export function NotFound(resource: string, id: number | string) {
            return new Error(`Resource ${resource} with id ${id} not found`)
        }

        export function NoDefaultView(resource: string) {
            return new Error(`Resource ${resource} has no default view`)
        }

        export function UnknownState(resource: string, state: string) {
            return new Error(`Resource ${resource} is at unknown state "${state}"`)
        }

        export function NoTransition(resource: string, state: string, event: string) {
            return new Error(`It's not possible to ${event} a ${state} ${resource}`)
        }

        export function Condition(message: string) {
            return new Error(message)
        }
    }
}