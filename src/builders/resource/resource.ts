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
import { EventParserBuilder, EventInputFromParser } from "../parser/event_parser"
import { $View, ViewPropFactory, ViewBuilder } from "./view"
import { DataSource } from "../../engine/data/datasource"
import { Resource } from "../../engine/resource"
import { View } from "../../engine/resource/view"
import { $Composition, Composition, CompositionBuilder } from "./compose"
import { NesoiClient } from "../../client"
import { $ResourceCreate, ResourceCreateBuilder } from "./create"
import { CreateSchema } from "../../engine/schema"
import { EventParser } from "../../engine/parser/event.parser"

// Resource

export class ResourceBuilder<
    Client extends NesoiClient<any, any>,
    Model extends ResourceModel,
    Events extends EventParserBuilder = {},
    Views = unknown,
    Compositions = unknown,
    States = unknown,
    StatesUnion = unknown
> {

    private _alias!: string
    private _create!: ResourceCreateBuilder<any>
    private _events: Events = {} as any
    private _views: Views = {} as any
    private _compositions: Compositions = {} as any
    private _states: States = {} as any
    
    // Transitions don't need to be strongly typed
    private _transitions = [] as TransitionBuilder<any,any,any,any,any>[]

    constructor(
        private engine: any,
        private name: string,
        private dataSource: DataSource<Model>
    ) {}

    alias(alias: string) {
        this._alias = alias;
        return this
    }

    create<
        Parser extends EventParserBuilder
    >($: $ResourceCreate<Model, Parser>) {
        const builder = new ResourceCreateBuilder<Model>(this.name)
        this._create = $(builder as any).build() as any;
        return this as any as ResourceBuilder<
            Client,
            Model,
            Events & { create: Parser },
            Views,
            Compositions,
            States,
            StatesUnion
        >
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
            Client,
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
            Client,
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
            Client,
            Model,
            Events,
            Views,
            Compositions,
            States & { [K in keyof Tree]: State },
            StatesUnion & keyof Tree
        >
    }

    transition<
        Extra,
        From
    >(
        $: $Transition<
            Client,
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
            Client,
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
            Client,
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
            EventInputFromParser<Events>,
            { [V in keyof Views]: View<Views[V] & ViewBuilder> }
        >(this)
    }

}
