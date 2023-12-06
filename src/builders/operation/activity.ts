/* eslint-disable @typescript-eslint/naming-convention */
import { $EventParser, EventParserBuilder, EventTypeFromParser } from '../parser/event_parser'
import { ActivityCondition } from 'App/Nesoi2/builders/condition'
import { ActivityMethod } from 'App/Nesoi2/method'

type Response = 'pass' | 'cancel'

export class ActivityStepBuilder<
  State extends string,
  EventParser extends EventParserBuilder,
  Event = unknown,
  Extra = unknown
> {
  protected _event: Event
  protected conditions: ActivityCondition<Event>[] = []
  protected fn: ActivityMethod<Event, Response>

  constructor (
    protected state: State
  ) {}

  public event<
    Parser extends EventParserBuilder
  > (event: $EventParser<Parser>) {
    this._event = event as any
    return this as any as ActivityStepBuilder<
        State,
        Parser,
        EventTypeFromParser<Parser>,
        Extra
    >
  }

  public with<
    Ext extends { [_: string]: any },
    g_Event extends Record<string, any>
  >(
    this: ActivityStepBuilder<
        State, EventParser, g_Event, Extra
    >, // Guarantee preceding event
    $: ActivityMethod<Event & Extra, Ext>
  ) {
    // const extra = $({ obj: {} as any, event: this._event as any });
    // Object.assign(this._event as any, extra);

    return this as any as ActivityStepBuilder<
            State,
            EventParser,
            Event,
            Extra & { [K in keyof Ext]: Ext[K] } // with.Extra
        >
  }

  public given<
    g_Event extends Record<string, any>
  > (
    this: ActivityStepBuilder<
        State, EventParser, g_Event, Extra
    >, // Guarantee preceding event
    condition: ActivityCondition<Event & Extra>
  ) {
    this.conditions.push(condition as any)
    return this
  }

  public do (
    fn: ActivityMethod<Event & Extra, 'pass' | 'cancel'>
  ) {
    this.fn = fn
    return this
  }
}

export class ActivityBuilder<
  RequestStep = unknown,
  Steps = unknown
> {
  protected requestStep: RequestStep
  protected steps: Steps[]

  constructor (
    protected name: string,
  ) {}

  public request<Extra> (
    $: $ActivityStep<'void', Extra>
  ) {
    const builder = new ActivityStepBuilder('void')
    this.requestStep = $(builder as any) as any
    return this as any as ActivityBuilder<
        ActivityStepBuilder<'void', any, Extra>,
        Steps
    >
  }

  public step<
    S extends (Steps extends unknown ? 'requested' : string),
    Extra
  > (
    state: S,
    $: $ActivityStep<S, Extra>
  ) {
    const builder = new ActivityStepBuilder('void')
    const step = $(builder as any)
    this.steps.push(step as any)
    return this as any as ActivityBuilder<
        RequestStep,
        Steps & ActivityStepBuilder<'void', any, Extra>
    >
  }
}

export type $ActivityStep<State extends string, Extra> =
    ($: ActivityStepBuilder<State,any,Extra>) => ActivityStepBuilder<State, any, Extra>
