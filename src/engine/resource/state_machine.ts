import { ResourceCondition } from "../../builders/job/condition";
import { ResourceMethod } from "../../builders/method";
import { DataSource } from "../../data/data_source";
import { ResourceModel } from "../../data/model";
import { NesoiError } from "../../error";
import { EventParser } from "../parser/event.parser";
import { Tree } from "../tree";

type Obj = Record<string, any>
type State = string

type StateSchema = {
    __type: 'state'
    alias: string
    _initial: boolean
    _final: boolean
    _states: StateTree
}
type StateTree = Record<State, StateSchema>

type TransitionTargetSchema = {
    state: string,
    conditions: ResourceCondition<any, any>[],
    before?: ResourceMethod<any, any, any>,
    after?: ResourceMethod<any, any, any>
}
type TransitionSchema = {
    _event: string,
    _from: string,
    _targets: TransitionTargetSchema[]
}
export class StateMachine<
    Model extends ResourceModel,
    Events
> {

    protected alias: string
    protected states: StateTree
    protected eventParsers: Record<string, EventParser<any, any>>
    protected transitions: TransitionSchema[]

    constructor(
        builder: any,
        protected dataSource: DataSource<ResourceModel>
    ) {
        this.alias = builder._alias
        this.states = builder._states
        
        this.eventParsers = {}
        for (const name in builder._events) {
            const eventBuilder = builder._events[name]
            this.eventParsers[name] = new EventParser(eventBuilder)
        }

        this.transitions = builder._transitions
    }

    private initialStateNode() {
        const initialNode = Tree.find(this.states._states, (_, value) => (value as any as StateSchema)._initial);
        if (!initialNode) {
            throw new Error(`[StateMachine] ${name} has no initial state`)
        }
        return initialNode
    }

    async send<
        E extends keyof Events
    >(id: Model['id'], event: E, data: Events[E]) {
        // TODO: queue

        // 1. Parse event
        const eventParser = this.eventParsers[event as any]
        const parsedEvent = await eventParser.parse(data as any);
        
        // 2. Read object from data source
        const obj = await this.dataSource.get(id);
        if (!obj) {
            throw NesoiError.Resource.NotFound(this.alias, id)
        }

        // 3. Find current object state in state tree
        const curStateNode = Tree.find(this.states, path => path === obj.state);
        if (!curStateNode) {
            throw NesoiError.Resource.UnknownState(this.alias, obj.state)
        }
        
        // 4. Find possible transitions
        const transitions = this.getTransitionsFrom(curStateNode.path, event)
        if (!transitions.length) {
            throw NesoiError.Resource.NoTransition(this.alias, curStateNode.value.alias, eventParser.alias)
        }

        // 5. Extract all targets from transitions
        const targets = [] as TransitionTargetSchema[]
        for (let t in transitions) {
            targets.push(...transitions[t]._targets)
        }

        // 6. Run targets sequentially until one works
        let target = undefined;
        for (const t in targets) {
            const triggered = await this.runTarget(targets[t], obj, parsedEvent);
            if (triggered) {
                target = targets[t]
                break
            }
        }

        // 7. Logs
        this.log(obj, parsedEvent, target)

    }

    private getTransitionsFrom(state: State, event?: keyof Events) {
        return this.transitions.filter(t => 
            t._from === state &&
            (!event || t._event === event)
        )
    }

    private async runTarget(target: TransitionTargetSchema, obj: Obj, event: Obj) {
        const canRunTarget = await this.checkTargetConditions(target, obj, event)
        if (!canRunTarget) {
            return false
        }
        if (target.before) {
            const promise = target.before({ obj, event })
            await Promise.resolve(promise)
        }
        if (target.after) {
            const promise = target.after({ obj, event })
            await Promise.resolve(promise)
        }
        return true
    }

    private async checkTargetConditions(target: TransitionTargetSchema, obj: Obj, event: Obj) {
        if (target.conditions.length === 0) {
            return true
        }
        for (const c in target.conditions) {
            const given = target.conditions[c]
            const promise = given.that({ obj, event })
            const valid = await Promise.resolve(promise)
            if (!valid) {
                return false
            }
        }
        return true
    }

    private async log(obj: Obj, event: Obj, target?: TransitionTargetSchema) {
        if (target) {
            console.log(`Transitioned to ${target.state}`)
        }
        else {
            console.log(`Transition failed`)
        }
    }

}
