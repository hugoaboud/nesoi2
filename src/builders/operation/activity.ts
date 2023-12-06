/* eslint-disable @typescript-eslint/naming-convention */
import { Client, NesoiClient } from '../../client'
import { DataSource } from '../../engine/data/datasource'
import { Activity, ActivityStep } from '../../engine/operation/activity'
import { ActivityLogModel, ActivityModel } from '../../engine/operation/activity.model'
import { SchedulingModel } from '../../engine/operation/scheduling.model'
import { ActivityCondition } from '../condition'
import { ActivityMethod } from '../method'
import { $EventParser, EventParserBuilder, EventParserPropFactory, EventTypeFromParser } from '../parser/event_parser'

type Response = 'pass' | 'cancel'

export class ActivitySource<
  A extends DataSource<ActivityModel>,
  L extends DataSource<ActivityLogModel<any>>,
  S extends DataSource<SchedulingModel>
> {
  constructor(
    public activities: A,
    public logs: L,
    public schedulings: S
  ) {}
}

export class ActivityStepBuilder<
  Client,
  State extends string,
  Event = unknown,
  Extra = unknown,
  Method = unknown
> {
  protected eventParser!: EventParserBuilder
  protected conditions: ActivityCondition<Client, Event>[] = []
  protected fn!: Method

  constructor (
    protected state: State
  ) {}

  public event<
    Parser extends EventParserBuilder
  > ($: $EventParser<Parser>) {
    this.eventParser = $(EventParserPropFactory) as any
    return this as any as ActivityStepBuilder<
        Client,
        State,
        EventTypeFromParser<Parser>,
        Extra,
        Method
    >
  }

  public with<
    Ext extends { [_: string]: any },
    g_Event extends Record<string, any>
  >(
    this: ActivityStepBuilder<Client, State, g_Event, Extra>, // Guarantee preceding event
    $: ActivityMethod<Client, Event & Extra, Ext>
  ) {
    // const extra = $({ obj: {} as any, event: this._event as any });
    // Object.assign(this._event as any, extra);

    return this as any as ActivityStepBuilder<
          Client,
          State,
          Event,
          Extra & { [K in keyof Ext]: Ext[K] }, // with.Extra
          Method
        >
  }

  public given<
    g_Event extends Record<string, any>
  > (
    this: ActivityStepBuilder<Client, State, g_Event, Extra>, // Guarantee preceding event
    condition: ActivityCondition<Client, Event & Extra>
  ) {
    this.conditions.push(condition as any)
    return this
  }

  public do<
    Fn extends ActivityMethod<Client, Event & Extra, Response>
  > (
    fn: Fn
  ) {
    this.fn = fn as any
    return this as any as ActivityStepBuilder<
      Client, State, Event, Extra, Fn
    >
  }

  public build() {
    return new ActivityStep(this)
  }
}

export class ActivityBuilder<
  Client extends NesoiClient<any, any>,
  Source extends ActivitySource<any,any,any>,
  RequestStep = unknown,
  Steps = unknown
> {
  protected requestStep!: RequestStep
  protected steps: Steps[] = []

  constructor (
    protected name: string,
    protected dataSource: Source,
    protected buildCallback?: (activity: Activity<any,any>) => void
  ) {}

  public request<
    Step extends $ActivityStep<Client, 'void', any>
  > (
    $: Step
  ) {
    const builder = new ActivityStepBuilder('void')
    this.requestStep = $(builder as any) as any
    return this as any as ActivityBuilder<
        Client,
        Source,
        ReturnType<Step>,
        Steps
    >
  }

  public step<
    S extends (IsFirstStep extends true ? 'requested' : string),
    Step extends $ActivityStep<Client, S, any>,
    IsFirstStep = Steps extends ActivityStepBuilder<any,any,any,any,any> ? false : true
  > (
    state: S,
    $: Step
  ) {
    const builder = new ActivityStepBuilder(state)
    const step = $(builder as any)
    this.steps.push(step as any)
    return this as any as ActivityBuilder<
        Client,
        Source,
        RequestStep,
        IsFirstStep extends true
          ? ReturnType<Step>
          : (Steps | ReturnType<Step>)
    >
  }

  public build() {
    const activity = new Activity<
      Client,
      Source,
      RequestStep,
      Steps
    >(this)
    if (this.buildCallback) {
      this.buildCallback(activity);
    }
    return activity;
  }
}

export type $ActivityStep<
  Client,
  State extends string,
  Event
> =
    ($: ActivityStepBuilder<Client, State, Event>) =>
      ActivityStepBuilder<Client, State, Event>