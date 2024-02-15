/**
 * [ Transition ]
 * 
 * A path from a base state to a list of target
 * states associated with an event.
 * 
 */

import { ResourceObj } from "../../engine/data/model";
import { ResourceCondition } from "../condition";
import { ResourceMethod } from "../method";
import { EventParserBuilder, EventInputFromParser, EventOutputFromParser } from "../parser/event_parser";

export class TransitionTargetBuilder<
    Client,
    Model extends ResourceObj,
    Event,
    Before extends ResourceMethod<Client, Model, Event, void>,
    After extends ResourceMethod<Client, Model, Event, void>
> {

    private conditions: ResourceCondition<Client, Model, Event>[] = []
    private before?: Before
    private after?: After

    constructor(
        private state: string
    ) {}

    /*
        Given
    */

    given(condition: ResourceCondition<Client, Model, Event>) {
        this.conditions.push(condition);
        return this;
    }
    
    andGiven(condition: ResourceCondition<Client, Model, Event>) {
        this.conditions.push(condition);
        return this;
    }
    
    /*
        Run
    */

    run<
        Method extends ResourceMethod<Client,Model, Event, void>
    >(
        this: TransitionTargetBuilder<Client, Model,Event,never,any>, // Guarantee single .run
        before: Method
    ) {
        (this.before as any) = before;
        return this as any as TransitionTargetBuilder<Client, Model,Event,Method,After>;
    }

    thenRun<
        Method extends ResourceMethod<Client,Model, Event, void>
    >(
        this: TransitionTargetBuilder<Client, Model,Event,any,never>, // Guarantee single .thenRun
        after: Method
    ) {
        (this.after as any) = after;
        return this as any as TransitionTargetBuilder<Client, Model,Event,Before,Method>;
    }

}

export class TransitionBuilder<
    Client,
    Name extends string,
    Model extends ResourceObj,
    StatesUnion extends string,
    Events extends EventParserBuilder,
    Event = unknown,
    Extra = unknown,
    From = unknown,
    To = unknown
> {

    private _event!: string
    private _from!: From
    private _targets: TransitionTargetBuilder<any, any, any, any, any>[] = []

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
            Client,
            E & string,
            Model,
            StatesUnion,
            Events,
            EventOutputFromParser<Events[E] & EventParserBuilder>,
            Extra,
            From
        >
    }

    /*
        From
    */

    from<
        S extends StatesUnion
    >(state: S | S[]) {
        (this._from as any) = state;
        return this as any as TransitionBuilder<
            Client,
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
            Client, Name, Model, StatesUnion, Events, g_Event, Extra, g_From
        >, // Guarantee preceding on/from
        $: ResourceMethod<Client, Model, Event & Extra, Ext>
    ) {
        // const extra = $({ obj: {} as any, event: this._event as any });
        // Object.assign(this._event as any, extra);

        return this as any as TransitionBuilder<
            Client,
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
        Client, Name, Model, StatesUnion, Events, g_Event, Extra, g_From
        >, // Guarantee preceding on/from
        $: ResourceMethod<Client, Model, Event & Extra, Ext>
    ) {
        // const extra = $({ obj: {} as any, event: this._event as any });
        // Object.assign(this._event as any, extra);

        return this as any as TransitionBuilder<
            Client,
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
        Before extends ResourceMethod<Client, Model, Event & Extra, void>,
        After extends ResourceMethod<Client, Model, Event & Extra, void>,
        S extends Exclude<StatesUnion, From> | '.',
        g_Event extends EventParserBuilder,
        g_From extends StatesUnion
    >(
        this: TransitionBuilder<
        Client, Name, Model, StatesUnion, Events, g_Event, Extra, g_From
        >, // Guarantee preceding on/from
        state: S,
        $?: $TransitionTarget<Client, Model, Event, Extra, Before, After>
    ) {
        let builder = new TransitionTargetBuilder<any, any, any, any, any>(state as any);
        if ($) {
            builder = $(builder as any) as any
        }
        (this._targets as any).push(builder);
        return this as any as TransitionBuilder<
            Client, Name, Model, StatesUnion, Events, Event, Extra, From, To | S
        >;
    }

    orTo<
        Before extends ResourceMethod<Client, Model, Event & Extra, void>,
        After extends ResourceMethod<Client, Model, Event & Extra, void>,
        S extends Exclude<StatesUnion, From> | '.',
        g_Event extends EventParserBuilder,
        g_From extends StatesUnion
    >(
        this: TransitionBuilder<
            Client, Name, Model, StatesUnion, g_Event, Event, Extra, g_From
        >, // Guarantee preceding on/from
        state: S,
        $?: $TransitionTarget<Client, Model, Event, Extra, Before, After>
    ) {
        let builder = new TransitionTargetBuilder<any, any, any, any, any>(state as any);
        if ($) {
            builder = $(builder as any) as any
        }
        (this._targets as any).push(builder);
        return this as any as TransitionBuilder<
            Client, Name, Model, StatesUnion, Events, Event, Extra, From & StatesUnion, To | S
        >;
    }

}

export type $TransitionTarget<
    Client,
    Model extends ResourceObj,
    Event,
    Extra,
    Before extends ResourceMethod<Client, Model, E, void>,
    After extends ResourceMethod<Client, Model, E, void>,
    E = Event & Extra
> = ($: TransitionTargetBuilder<Client, Model, E, never, never>) => TransitionTargetBuilder<Client, Model, E, Before, After>

export type $Transition<
    Client,
    Name extends string,
    Model extends ResourceObj,
    StatesUnion extends string,
    Events extends EventParserBuilder,
    Event,
    Extra,
    From
> = ($: TransitionBuilder<Client, never, Model, StatesUnion, Events, Event>) => TransitionBuilder<Client, Name, Model, StatesUnion, Events, Event, Extra, From>