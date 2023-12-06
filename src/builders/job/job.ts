/**
 * [ Job ]
 * 
 * An action that can be run synchronously or queued
 * 
 */

import { $Event, EventBuilder } from "../event";
import { JobMethod } from "../method";
import { EventParserBuilder } from "../parser/event_parser";
import { JobCondition } from "../condition";

// Resource

export class JobBuilder<
    Event extends EventParserBuilder,
    Extra = unknown,
    Action = unknown
> {

    private _event: Event = {} as any
    private conditions: JobCondition<Event & Extra>[] = []
    private action!: Action

    constructor(
        name: string,
        $: $Event<Event>
    ) {
        const builder = new EventBuilder(name);
        (this._event as any) = $(builder);
    }

    with<
        Ext extends { [_: string]: any }
    >(
        $: JobMethod<Event & Extra, Ext>
    ) {
        const extra = $({ event: this._event as any });
        Object.assign(this._event as any, extra);

        return this as any as JobBuilder<
            Event,
            Extra & { [K in keyof Ext]: Ext[K] }
        >
    }

    andWith<
        Ext extends { [_: string]: any }
    >(
        $: JobMethod<Event & Extra, Ext>
    ) {
        const extra = $({ event: this._event as any });
        Object.assign(this._event as any, extra);

        return this as any as JobBuilder<
            Event,
            Extra & { [K in keyof Ext]: Ext[K] }
        >
    }

    /*
        Given
    */

    given(condition: JobCondition<Event & Extra>) {
        this.conditions.push(condition);
        return this;
    }
    
    andGiven(condition: JobCondition<Event & Extra>) {
        this.conditions.push(condition);
        return this;
    }

    /*
        Action
    */

    run<
        Method extends JobMethod<Event & Extra, void>
    >(
        method: Method
    ) {
        (this.action as any) = method;
        return this as any as JobBuilder<Event, Extra, Method>;
    }

}