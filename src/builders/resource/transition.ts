/**
 * [ Transition ]
 * 
 * A path from a base state to a list of target
 * states associated with an event.
 * 
 */

import { ResourceModel } from "../../model";
import { ResourceCondition } from "../job/condition";
import { EventSchema } from "../event";
import { ResourceMethod } from "../method";

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
        method: Method
    ) {
        (this.before as any) = method;
        return this as any as TransitionTargetBuilder<Model,Event,Method,After>;
    }

    thenRun(
        this: TransitionTargetBuilder<Model,Event,any,never>, // Guarantee single .thenRun
        method: ResourceMethod<Model, Event, void>
    ) {
        (this.after as any) = method;
        return this as any as TransitionTargetBuilder<Model,Event,Before,typeof method>;
    }

}

class TransitionBuilder<
    Model extends ResourceModel,
    Events extends EventSchema,
    StatesUnion extends string,
    Event = unknown,
    Extra = unknown,
    From = unknown,
    To = never
> {

    private _eventName!: string
    private _event!: Event
    private _from!: From
    private _targets: TransitionTargetBuilder<Model, Event & Extra, any, any>[] = []

    constructor(
        private events: Events
    ) {}

    /*
        On
    */

    on<
        E extends keyof Events
    >(event: E) {
        (this._eventName as any) = event;
        (this._event as any) = this.events[event];
        return this as any as TransitionBuilder<
            Model,
            Events,
            StatesUnion,
            Events[E], // on.Event
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
            Model,
            Events,
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
        Ext extends { [_: string]: any }
    >(
        this: TransitionBuilder<
            Model, Events, StatesUnion, Events[keyof Events], Extra, StatesUnion
        >, // Guarantee preceding on/from
        $: ResourceMethod<Model, Event & Extra, Ext>
    ) {
        const extra = $({ obj: {} as any, event: this._event as any });
        Object.assign(this._event as any, extra);

        return this as any as TransitionBuilder<
            Model,
            Events,
            StatesUnion,
            Event,
            Extra & { [K in keyof Ext]: Ext[K] }, // with.Extra
            From
        >
    }

    andWith<
        Ext extends { [_: string]: any }
    >(
        this: TransitionBuilder<
            Model, Events, StatesUnion, Events[keyof Events], Extra, StatesUnion
        >, // Guarantee preceding on/from
        $: ResourceMethod<Model, Event & Extra, Ext>
    ) {
        const extra = $({ obj: {} as any, event: this._event as any });
        Object.assign(this._event as any, extra);

        return this as any as TransitionBuilder<
            Model,
            Events,
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
        S extends Exclude<StatesUnion, From>
    >(
        this: TransitionBuilder<
            Model, Events, StatesUnion, Events[keyof Events], Extra, StatesUnion
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
            Model, Events, StatesUnion, Events[keyof Events], Extra, From & StatesUnion, To | S
        >;
    }

    orTo<
        Before extends ResourceMethod<Model, Event & Extra, void>,
        After extends ResourceMethod<Model, Event & Extra, void>,
        S extends Exclude<StatesUnion, From>
    >(
        this: TransitionBuilder<
            Model, Events, StatesUnion, Events[keyof Events], Extra, StatesUnion
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
            Model, Events, StatesUnion, Events[keyof Events], Extra, From & StatesUnion, To | S
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
    Model extends ResourceModel,
    Events extends EventSchema,
    StatesUnion extends string,
    Event,
    Extra,
    From
> = ($: TransitionBuilder<Model, Events, StatesUnion>) => TransitionBuilder<Model, Events, StatesUnion, Event, Extra, From>