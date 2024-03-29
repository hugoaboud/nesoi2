import { Bucket } from "../data/bucket";
import { ResourceObj } from "../data/model";
import { NesoiError } from "../../error";
import { EventParser } from "../parser/event.parser";
import { Tree } from "../../helpers/tree";
import { NesoiEngine } from "../../engine";
import { Obj, State, StateSchema, StateTree, TransitionSchema, TransitionTargetSchema } from "../schema";
import { NesoiClient } from "../../client";

export class StateMachine<
    Model extends ResourceObj,
    Events
> {
    
    protected name: string
    protected engine: NesoiEngine<any,any,any,any>
    protected alias: string
    protected states: StateTree
    protected eventParsers: Record<string, EventParser<any, any>>
    protected transitions: TransitionSchema[]

    constructor(
        builder: any,
        protected bucket: Bucket<ResourceObj>
    ) {
        this.name = builder.name
        this.engine = builder.engine
        this.alias = builder._alias
        this.states = builder._states
        
        this.eventParsers = {}
        for (const name in builder._events) {
            const eventBuilder = builder._events[name]
            this.eventParsers[name] = eventBuilder.build()
        }

        this.transitions = builder._transitions
    }

    private initialStateNode() {
        const initialNode = Tree.find(this.states._states, (_, value) => (value as any as StateSchema)._initial);
        if (!initialNode) {
            throw new Error(`[StateMachine] ${this.name} has no initial state`)
        }
        return initialNode
    }

    async send<
        E extends keyof Events
    >(client: NesoiClient<any,any>, id: Model['id'], event: E, data: Events[E]) {
        // TODO: queue

        // 1. Parse event
        const eventParser = this.eventParsers[event as any]
        const parsedEvent = await eventParser.parse(client, data as any);
        
        // 2. Read object from data source
        const obj = await this.bucket.get(client, id);
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
            const triggered = await this.runTarget(client, targets[t], obj, parsedEvent);
            if (triggered) {
                target = targets[t]
                break
            }
        }

        // 7. Logs
        this.log(obj, parsedEvent, target)

    }

    public getInitialState() {
        for (let state in this.states) {
            if (this.states[state]._initial) {
                return state
            }
        }
    }

    private getTransitionsFrom(state: State, event?: keyof Events) {
        return this.transitions.filter(t => 
            t._from === state &&
            (!event || t._event === event)
        )
    }

    private async runTarget(client: NesoiClient<any,any>, target: TransitionTargetSchema, obj: Obj, event: Obj) {
        // 1. Check conditions
        const canRunTarget = await this.checkTargetConditions(client, target, obj, event)
        if (!canRunTarget) {
            return false
        }
        // 2. Run first method ("before" changing state)
        if (target.before) {
            const promise = target.before({ client, obj, event })
            await Promise.resolve(promise)
        }
        // 3. Update state and save
        obj.state = target.state
        await this.bucket.put(client, obj as any);
        // 4. Run second method ("after" changin state)
        if (target.after) {
            const promise = target.after({ client, obj, event })
            await Promise.resolve(promise)
            await this.bucket.put(client, obj as any);
        }
        return true
    }

    private async checkTargetConditions(client: NesoiClient<any,any>, target: TransitionTargetSchema, obj: Obj, event: Obj) {
        if (target.conditions.length === 0) {
            return true
        }
        for (const c in target.conditions) {
            const given = target.conditions[c]
            const promise = given.that({ client, obj, event })
            const valid = await Promise.resolve(promise)
            if (!valid) {
                if (given.else) {
                    if (typeof given.else === 'string') {
                        throw NesoiError.Resource.Condition(given.else)
                    }
                    const promise = given.else({ client, obj, event})
                    const msg = await Promise.resolve(promise)
                    throw NesoiError.Resource.Condition(msg)
                }
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
