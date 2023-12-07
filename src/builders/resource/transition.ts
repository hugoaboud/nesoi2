/**
 * [ Transition ]
 * 
 * A path from a base state to a list of target
 * states associated with an event.
 * 
 */

import { ResourceModel } from "../../engine/data/model";
import { ResourceCondition } from "../condition";
import { ResourceMethod } from "../method";
import { EventParserBuilder, EventTypeFromParser } from "../parser/event_parser";

export class TransitionTargetBuilder<
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
    Events extends EventParserBuilder,
    Event = unknown,
    Extra = unknown,
    From = unknown,
    To = unknown
> {

    private _event!: string
    private _from!: From
    private _targets: TransitionTargetBuilder<any, any, any, any>[] = []

    /*
        On
    */

    on<
        E extends keyof Events
    >(
        event: E
    ) {
        this._event = event as string;
        return this as any as TransitionBuilder<
            E & string,
            Model,
            StatesUnion,
            Events,
            EventTypeFromParser<Events[E] & EventParserBuilder>,
            Extra,
            From
        >
    }

    /*
        From
    */

    from<
        S extends (Name extends 'create' ? 'void' : Exclude<StatesUnion,'void'>)
    >(state: S | S[]) {
        (this._from as any) = state;
        return this as any as TransitionBuilder<
            Name,
            Model,
            StatesUnion,
            Events,
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
        g_Event extends EventParserBuilder,
        g_From extends StatesUnion
    >(
        this: TransitionBuilder<
            Name, Model, StatesUnion, Events, g_Event, Extra, g_From
        >, // Guarantee preceding on/from
        $: ResourceMethod<Model, Event & Extra, Ext>
    ) {
        const extra = $({ obj: {} as any, event: this._event as any });
        Object.assign(this._event as any, extra);

        return this as any as TransitionBuilder<
            Name,
            Model,
            StatesUnion,
            Events,
            g_Event,
            Extra & { [K in keyof Ext]: Ext[K] }, // with.Extra
            From
        >
    }

    andWith<
        Ext extends { [_: string]: any },
        g_Event extends EventParserBuilder,
        g_From extends StatesUnion
    >(
        this: TransitionBuilder<
            Name, Model, StatesUnion, Events, g_Event, Extra, g_From
        >, // Guarantee preceding on/from
        $: ResourceMethod<Model, Event & Extra, Ext>
    ) {
        const extra = $({ obj: {} as any, event: this._event as any });
        Object.assign(this._event as any, extra);

        return this as any as TransitionBuilder<
            Name,
            Model,
            StatesUnion,
            Events,
            g_Event,
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
        S extends Exclude<StatesUnion, From|'void'> | (From extends 'void' ? never : '.'),
        g_Event extends EventParserBuilder,
        g_From extends StatesUnion
    >(
        this: TransitionBuilder<
            Name, Model, StatesUnion, Events, g_Event, Extra, g_From
        >, // Guarantee preceding on/from
        state: S,
        $?: $TransitionTarget<Model, Event, Extra, Before, After>
    ) {
        let builder = new TransitionTargetBuilder<any, any, any, any>(state as any);
        if ($) {
            builder = $(builder as any) as any
        }
        (this._targets as any).push(builder);
        return this as any as TransitionBuilder<
            Name, Model, StatesUnion, Events, Event, Extra, From, To | S
        >;
    }

    orTo<
        Before extends ResourceMethod<Model, Event & Extra, void>,
        After extends ResourceMethod<Model, Event & Extra, void>,
        S extends Exclude<StatesUnion, From|'void'> | (From extends 'void' ? never : '.'),
        g_Event extends EventParserBuilder,
        g_From extends StatesUnion
    >(
        this: TransitionBuilder<
            Name, Model, StatesUnion, g_Event, Event, Extra, g_From
        >, // Guarantee preceding on/from
        state: S,
        $?: $TransitionTarget<Model, Event, Extra, Before, After>
    ) {
        let builder = new TransitionTargetBuilder<any, any, any, any>(state as any);
        if ($) {
            builder = $(builder as any) as any
        }
        (this._targets as any).push(builder);
        return this as any as TransitionBuilder<
            Name, Model, StatesUnion, Events, Event, Extra, From & StatesUnion, To | S
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
    Events extends EventParserBuilder,
    Event,
    Extra,
    From
> = ($: TransitionBuilder<never, Model, StatesUnion, Events, Event>) => TransitionBuilder<Name, Model, StatesUnion, Events, Event, Extra, From>