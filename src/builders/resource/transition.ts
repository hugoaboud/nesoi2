/**
 * [ Transition ]
 * 
 * A path from a base state to a list of target
 * states associated with an event.
 * 
 */

import { ResourceModel } from "../../data/model";
import { ResourceCondition } from "../job/condition";
import { $Event, EventBuilder, EventSchema } from "../event";
import { ResourceMethod } from "../method";
import { EventParserSchema } from "../parser/event_parser";

export type TransitionSchema<
    Event extends EventParserSchema
> = {
    _name: string
    _event: Event
    _from: string
    _targets: {
        state: string
        conditions: ResourceCondition<any, any>[]
        before: ResourceMethod<any, any, void>
        after: ResourceMethod<any, any, void>
    }[]
}

class TransitionTargetBuilder<
    Model extends ResourceModel,
    Event,
    Before extends ResourceMethod<Model, Event, void>,
    After extends ResourceMethod<Model, Event, void>
> {

    private conditions: ResourceCondition<Model, Event>[] = []
    private before?: Before
    private after?: After

    constructor(
        private state: string
    ) {}

    /*
        Given
    */

    given(condition: ResourceCondition<Model, Event>) {
        this.conditions.push(condition);
        return this;
    }
    
    andGiven(condition: ResourceCondition<Model, Event>) {
        this.conditions.push(condition);
        return this;
    }
    
    /*
        Run
    */

    run<
        Method extends ResourceMethod<Model, Event, void>
    >(
        this: TransitionTargetBuilder<Model,Event,never,any>, // Guarantee single .run
        before: Method
    ) {
        (this.before as any) = before;
        return this as any as TransitionTargetBuilder<Model,Event,Method,After>;
    }

    thenRun<
        Method extends ResourceMethod<Model, Event, void>
    >(
        this: TransitionTargetBuilder<Model,Event,any,never>, // Guarantee single .thenRun
        after: Method
    ) {
        (this.after as any) = after;
        return this as any as TransitionTargetBuilder<Model,Event,Before,Method>;
    }

}

export class TransitionBuilder<
    Name extends string,
    Model extends ResourceModel,
    StatesUnion extends string,
    Event = unknown,
    Extra = unknown,
    From = unknown,
    To = never
> {

    private _name!: string
    private _event!: Event
    private _from!: From
    private _targets: TransitionTargetBuilder<Model, Event & Extra, any, any>[] = []

    /*
        On
    */

    on<
        E extends string,
        Schema extends EventParserSchema
    >(
        name: E,
        $: $Event<Schema>
    ) {
        this._name = name;
        const builder = new EventBuilder(name);
        (this._event as any) = $(builder);
        return this as any as TransitionBuilder<
            E,
            Model,
            StatesUnion,
            Schema, // on.Event
            Extra,
            From
        >
    }

    /*
        From
    */

    from<
        S extends StatesUnion
    >(state: S) {
        (this._from as any) = state;
        return this as any as TransitionBuilder<
            Name,
            Model,
            StatesUnion,
            Event,
            Extra,
            S   // from.State
        >
    }

    /*
        With
    */

    with<
        Ext extends { [_: string]: any },
        g_Event extends EventParserSchema,
        g_From extends StatesUnion
    >(
        this: TransitionBuilder<
            Name, Model, StatesUnion, g_Event, Extra, g_From
        >, // Guarantee preceding on/from
        $: ResourceMethod<Model, Event & Extra, Ext>
    ) {
        const extra = $({ obj: {} as any, event: this._event as any });
        Object.assign(this._event as any, extra);

        return this as any as TransitionBuilder<
            Name,
            Model,
            StatesUnion,
            Event,
            Extra & { [K in keyof Ext]: Ext[K] }, // with.Extra
            From
        >
    }

    andWith<
        Ext extends { [_: string]: any },
        g_Event extends EventParserSchema,
        g_From extends StatesUnion
    >(
        this: TransitionBuilder<
            Name, Model, StatesUnion, g_Event, Extra, g_From
        >, // Guarantee preceding on/from
        $: ResourceMethod<Model, Event & Extra, Ext>
    ) {
        const extra = $({ obj: {} as any, event: this._event as any });
        Object.assign(this._event as any, extra);

        return this as any as TransitionBuilder<
            Name,
            Model,
            StatesUnion,
            Event,
            Extra & { [K in keyof Ext]: Ext[K] }, // with.Extra
            From
        >
    }

    /*
        To
    */

    to<
        Before extends ResourceMethod<Model, Event & Extra, void>,
        After extends ResourceMethod<Model, Event & Extra, void>,
        S extends Exclude<StatesUnion, From>,
        g_Event extends EventParserSchema,
        g_From extends StatesUnion
    >(
        this: TransitionBuilder<
            Name, Model, StatesUnion, g_Event, Extra, g_From
        >, // Guarantee preceding on/from
        state: S,
        $?: $TransitionTarget<Model, Event, Extra, Before, After>
    ) {
        const builder = new TransitionTargetBuilder<any, any, any, any>(state as any);
        if ($) {
            const target = $(builder as any) as any
            (this._targets as any).push(target);
        }
        return this as any as TransitionBuilder<
            Name, Model, StatesUnion, EventParserSchema, Extra, From & StatesUnion, To | S
        >;
    }

    orTo<
        Before extends ResourceMethod<Model, Event & Extra, void>,
        After extends ResourceMethod<Model, Event & Extra, void>,
        S extends Exclude<StatesUnion, From>,
        g_Event extends EventParserSchema,
        g_From extends StatesUnion
    >(
        this: TransitionBuilder<
            Name, Model, StatesUnion, g_Event, Extra, g_From
        >, // Guarantee preceding on/from
        state: S,
        $?: $TransitionTarget<Model, Event, Extra, Before, After>
    ) {
        const builder = new TransitionTargetBuilder<any, any, any, any>(state as any);
        if ($) {
            const target = $(builder as any) as any
            (this._targets as any).push(target);
        }
        return this as any as TransitionBuilder<
            Name, Model, StatesUnion, EventParserSchema, Extra, From & StatesUnion, To | S
        >;
    }

}

export type $TransitionTarget<
    Model extends ResourceModel,
    Event,
    Extra,
    Before extends ResourceMethod<Model, E, void>,
    After extends ResourceMethod<Model, E, void>,
    E = Event & Extra
> = ($: TransitionTargetBuilder<Model, E, never, never>) => TransitionTargetBuilder<Model, E, Before, After>

export type $Transition<
    Name extends string,
    Model extends ResourceModel,
    StatesUnion extends string,
    Event,
    Extra,
    From
> = ($: TransitionBuilder<Name, Model, StatesUnion>) => TransitionBuilder<Name, Model, StatesUnion, Event, Extra, From>