/**
 * [ Resource ]
 * 
 * A composable state machine for the web.
 * 
 */

import { ResourceModel } from "../../model"
import { $Event, EventBuilder, EventSchema } from "../event"
import { $States, StateFactory, StateTree, State } from "./states"
import { $Transition } from "./transition"
import { EventParserSchema } from "../parser/event_parser"
import { $View, ViewPropFactory, ViewSchema } from "./view"

// Resource

export class ResourceBuilder<
    Model extends ResourceModel,
    Events = unknown,
    Views = unknown,
    States = unknown,
    StatesUnion = unknown
> {

    private _alias!: string
    private _events: Events = {} as any
    private _views: Views = {} as any
    private _states: States = {} as any

    constructor(
        private name: string,
        private model: new (...args: any) => Model
    ) {}

    alias(alias: string) {
        this._alias = alias;
        return this
    }

    event<
        K extends string,
        Schema extends EventParserSchema
    >(
        name: K,
        $: $Event<Schema>
    ) {
        const builder = new EventBuilder(name);
        (this._events as any)[name] = $(builder);
        
        return this as any as ResourceBuilder<
            Model,
            Events & { [E in K]: Schema },
            Views,
            States,
            StatesUnion
        >
    }

    view<
        K extends string,
        Schema extends ViewSchema
    >(
        name: K,
        $: $View<Model, Schema>
    ) {
        const factory = new ViewPropFactory();
        (this._views as any)[name] = $(factory);

        return this as any as ResourceBuilder<
            Model,
            Events,
            Views & { [E in K]: Schema },
            States,
            StatesUnion
        >
    }

    states<
        Tree extends StateTree
    >(
        $: $States<Tree>
    ) {
        const states = $(StateFactory);
        Object.assign(this._states as any, states);

        type StateSchema = States & { [K in keyof Tree]: State } // makes type preview nicer
        return this as any as ResourceBuilder<
            Model,
            Events,
            Views,
            StateSchema,
            StatesUnion & keyof Tree
        >
    }

    transition<
        Event,
        Extra,
        From
    >(
        $: $Transition<
            Model,
            Events extends EventSchema ? Events : never,
            StatesUnion extends string ? StatesUnion : never,
            Event,
            Extra,
            From
        >
    ) {
        return this
    }

}