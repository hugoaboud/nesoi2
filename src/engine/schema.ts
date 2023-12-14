import { ResourceCondition } from "../builders/condition"
import { ResourceMethod } from "../builders/method"
import { EventParseMethod, EventParserRule } from "../builders/parser/event_parser"
import { EventParser } from "./parser/event.parser"

export type Obj = Record<string, any>
export type State = string

/* State */

export type StateSchema = {
    __type: 'state'
    alias: string
    _initial: boolean
    _final: boolean
    _states: StateTree
}
export type StateTree = Record<State, StateSchema>

/* Event */

export type EventPropSchema = {
    __type: 'event.prop'
    alias: string
    required: boolean
    default?: any
    method: EventParseMethod<any,any>
    rules: EventParserRule<any,any>[]
}

export type EventSchema = {
    [_: string]: EventPropSchema | EventSchema
}

/* Transition */

export type TransitionTargetSchema = {
    state: string,
    conditions: ResourceCondition<any, any, any>[],
    before?: ResourceMethod<any, any, any, any>,
    after?: ResourceMethod<any, any, any, any>
}
export type TransitionSchema = {
    _event: string,
    _from: string,
    _targets: TransitionTargetSchema[]
}

/* Create */

export type CreateSchema = {
    event: EventParser<any>,
    method: ResourceMethod<any, any, any, any>
}