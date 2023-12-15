import { EventParserPropBuilder, EventParserRule } from "./builders/parser/event_parser";

export namespace NesoiError {

    class BaseError extends Error {
        status = 422
        constructor(message: string) {
            super(message)
        }
    }

    export function Condition(message: string) {
        return new BaseError(message)
    }
    

    export namespace Task {
        
        export function Invalid(name: string) {
            return new BaseError(`Task ${name} not found`)
        }
        
        export function NotFound(name: string, id: number) {
            return new BaseError(`Task ${name} with id ${id} not found`)
        }
        
        export function InvalidState(name: string, id: number, state: string) {
            return new BaseError(`Task ${name} with id ${id} is at invalid state ${state}`)
        }
        
        export function InvalidStateExecute(name: string, state: string) {
            return new BaseError(`Execute task ${name} reached invalid state ${state}`)
        }

    }

    export namespace Event {
        
        export function Sanitize(message: string) {
            return new BaseError(message)
        }

        export function Required(prop: any) {
            return new BaseError(`${prop.alias} is required`)
        }

        export function Parse(prop: any, type: string) {
            return new BaseError(`${prop.alias} is not ${type}`)
        }

        export function Rule(rule: EventParserRule<any, any>, prop: EventParserPropBuilder<any, any>) {
            return new BaseError(rule.error(prop))
        }

        export function FileSize(prop: any, maxSize: number) {
            return new BaseError(`${prop.alias} size exceeds max (${maxSize})`)
        }

        export function FileExtName(prop: any, options: string[]) {
            return new BaseError(`${prop.alias} extension not allowed. Options: ${options}`)
        }

    }

    export namespace Resource {

        export function NotFound(resource: string, id: number | string) {
            return new BaseError(`Resource ${resource} with id ${id} not found`)
        }

        export function NoDefaultView(resource: string) {
            return new BaseError(`Resource ${resource} has no default view`)
        }

        export function UnknownState(resource: string, state: string) {
            return new BaseError(`Resource ${resource} is at unknown state "${state}"`)
        }

        export function NoTransition(resource: string, state: string, event: string) {
            return new BaseError(`It's not possible to ${event} a ${state} ${resource}`)
        }

        export function Condition(message: string) {
            return new BaseError(message)
        }
    }
}