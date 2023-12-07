/**
 * [ Resource ]
 * 
 * A composable state machine for the web.
 * 
 */

import { ResourceModel } from "../../engine/data/model"
import { $Event, EventBuilder } from "../event"
import { $States, StateFactory, StateTree, State } from "./states"
import { $Transition, TransitionBuilder } from "./transition"
import { EventParserBuilder, EventTypeFromParser } from "../parser/event_parser"
import { $View, ViewPropFactory, ViewBuilder } from "./view"
import { DataSource } from "../../engine/data/datasource"
import { Resource } from "../../engine/resource"
import { View } from "../../engine/resource/view"
import { $Composition, Composition, CompositionBuilder } from "./compose"

// Resource

export class ResourceBuilder<
    Model extends ResourceModel,
    Events extends EventParserBuilder = {},
    Views = unknown,
    Compositions = unknown,
    States = unknown,
    StatesUnion = unknown
> {

    private _alias!: string
    private _events: Events = {} as any
    private _views: Views = {} as any
    private _compositions: Compositions = {} as any
    private _states: States = {} as any
    
    // Transitions don't need to be strongly typed
    private _transitions = [] as TransitionBuilder<any,any,any,any>[]

    constructor(
        private engine: any,
        private name: string,
        private dataSourceClass: new (...args: any) => DataSource<Model>
    ) {}

    alias(alias: string) {
        this._alias = alias;
        return this
    }

    event<
        K extends string,
        Parser extends EventParserBuilder
    >(
        name: K,
        $: $Event<Parser>
    ) {
        const builder = new EventBuilder(name);
        (this._events as any)[name] = $(builder);
        
        return this as any as ResourceBuilder<
            Model,
            Events & { [E in K]: Parser },
            Views,
            Compositions,
            States,
            StatesUnion
        >
    }

    view<
        K extends string,
        View extends ViewBuilder
    >(
        name: K,
        $: $View<Model, View>
    ) {
        const factory = new ViewPropFactory();
        (this._views as any)[name] = $(factory as any);

        return this as any as ResourceBuilder<
            Model,
            Events,
            Views & { [E in K]: View },
            Compositions,
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

        return this as any as ResourceBuilder<
            Model,
            Events,
            Views,
            Compositions,
            States & { [K in keyof Tree]: State },
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
        this._transitions.push(transition as any)
        return this as any as ResourceBuilder<
            Model,
            Events,
            Views,
            Compositions,
            States,
            StatesUnion
        >
    }

    compose<
        K extends string,
        ChildModel extends ResourceModel
    >(
        other_name: K,
        $?: $Composition<Model, ChildModel>
    ) {
        const builder = new CompositionBuilder(this.name, other_name);
        if ($) {
            (this._compositions as any)[other_name] = $(builder as any);
        }
        
        return this as any as ResourceBuilder<
            Model,
            Events,
            Views,
            Compositions & { [E in K]: ChildModel },
            States,
            StatesUnion
        >
    }

    build() {
        return new Resource<
            Model,
            EventTypeFromParser<Events>,
            { [V in keyof Views]: View<Views[V] & ViewBuilder> }
        >(this)
    }

}
