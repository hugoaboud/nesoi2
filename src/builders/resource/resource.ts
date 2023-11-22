/**
 * [ Resource ]
 * 
 * A composable state machine for the web.
 * 
 */

import { ResourceModel } from "../../data/model"
import { $Event, EventParserBuilder } from "../event"
import { $States, StateFactory, StateTree, State, StateSchema } from "./states"
import { $Transition, TransitionBuilder } from "./transition"
import { EventParserSchema } from "../parser/event_parser"
import { $View, ViewPropFactory, ViewSchema } from "./view"
import { DataSource } from "../../data/data_source"

// Resource

export type ResourceSchema<
    Model extends ResourceModel,
    Events extends EventParserSchema
> = {
    name: string,
    dataSourceClass: new (...args: any) => DataSource<Model>,
    _alias: string
    _events: Events,
    _views: ViewSchema,
    _states: StateSchema
}

export class ResourceBuilder<
    Model extends ResourceModel,
    Events extends EventParserSchema = {},
    Views = unknown,
    States = unknown,
    StatesUnion = unknown,
    Transitions = unknown
> {

    private _alias!: string
    private _events: Events = {} as any
    private _views: Views = {} as any
    private _states: States = {} as any
    private _transitions: Transitions = [] as any

    constructor(
        private name: string,
        private dataSourceClass: new (...args: any) => DataSource<Model>
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
        const builder = new EventParserBuilder(name);
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
            StatesUnion & keyof Tree | 'void'
        >
    }

    transition<
        Extra,
        From
    >(
        $: $Transition<
            any,
            Model,
            StatesUnion extends string ? StatesUnion : never,
            Events,
            any,
            Extra,
            From
        >
    ) {
        const builder = new TransitionBuilder();
        const transition = $(builder as any);
        return this as any as ResourceBuilder<
            Model,
            Events,
            Views,
            States,
            StatesUnion,
            Transitions
        >
    }

}

export type ResourceBuilderToSchema<Builder> = ResourceSchema<
    Builder extends ResourceBuilder<infer X, any> ? X : never,
    Builder extends ResourceBuilder<any, infer X>
        ? X extends EventParserSchema ? X : never
        : never
>