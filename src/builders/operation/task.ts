/* eslint-disable @typescript-eslint/naming-convention */
import { Client, NesoiClient } from '../../client'
import { DataSource } from '../../engine/data/datasource'
import { Task, TaskStep } from '../../engine/operation/task'
import { TaskLogModel, TaskModel } from '../../engine/operation/task.model'
import { ScheduleModel } from '../../engine/operation/schedule.model'
import { TaskCondition } from '../condition'
import { TaskMethod } from '../method'
import { $EventParser, EventParserBuilder, EventParserPropFactory, EventInputFromParser } from '../parser/event_parser'
import { NesoiEngine } from '../../engine'

export class TaskSource<
  A extends DataSource<TaskModel>,
  L extends DataSource<TaskLogModel<any>>,
  S extends DataSource<ScheduleModel>
> {
  constructor(
    public tasks: A,
    public logs: L,
    public schedules: S
  ) {}
}

export type TaskStepAlias = {
  state: string
  action: string
  done: string
}

export class TaskStepBuilder<
  Client,
  State extends string,
  PreviousEvents,
  Event = unknown,
  Extra = unknown,
  Method = unknown
> {
  protected aliasDef?: TaskStepAlias
  protected eventParser!: EventParserBuilder
  protected conditionsAndExtras: (TaskCondition<any,any,any> | TaskMethod<any,any,any,any>)[] = []
  protected fn!: Method
  protected logFn?: Method

  constructor (
    protected state: State
  ) {}

  public alias($: TaskStepAlias) {
    this.aliasDef = $;
    return this
  }

  public event<
    Parser extends EventParserBuilder
  > (parser: $EventParser<Parser>) {
    this.eventParser = parser(EventParserPropFactory) as any
    return this as any as TaskStepBuilder<
        Client,
        State,
        PreviousEvents,
        EventInputFromParser<Parser>,
        Extra,
        Method
    >
  }

  public with<
    Ext extends { [_: string]: any },
    g_Event extends Record<string, any>
  >(
    this: TaskStepBuilder<Client, State, PreviousEvents, g_Event, Extra>, // Guarantee preceding event
    extra: TaskMethod<Client, Event & Extra, PreviousEvents, Ext>
  ) {
    this.conditionsAndExtras.push(extra as any)
    return this as any as TaskStepBuilder<
          Client,
          State,
          PreviousEvents,
          Event,
          Extra & { [K in keyof Ext]: Ext[K] }, // with.Extra
          Method
        >
  }

  public given<
    g_Event extends Record<string, any>
  > (
    this: TaskStepBuilder<Client, State, PreviousEvents, g_Event, Extra>, // Guarantee preceding event
    condition: TaskCondition<Client, Event & Extra, PreviousEvents>
  ) {
    this.conditionsAndExtras.push(condition as any)
    return this
  }

  public do<
    Fn extends TaskMethod<Client, Event & Extra, PreviousEvents, Record<string, any>>
  > (
    fn: Fn
  ) {
    this.fn = fn as any
    return this as any as TaskStepBuilder<
      Client, State, PreviousEvents, Event, Extra, Fn
    >
  }

  public log<
    Fn extends TaskMethod<Client, Event & Extra, PreviousEvents, string>
  > (
    fn: Fn
  ) {
    this.logFn = fn as any
    return this
  }

  public build() {
    return new TaskStep(this)
  }
}

export type TaskStepEvent<Step> = Step extends TaskStepBuilder<any, any, any, infer X> ? X : {}
export type TaskStepExtra<Step> = Step extends TaskStepBuilder<any, any, any, any, infer X> ? X : {}

export class TaskBuilder<
  Client extends NesoiClient<any, any>,
  Source extends TaskSource<any,any,any>,
  RequestStep = unknown,
  Steps = unknown
> {
  protected requestStep!: RequestStep
  protected steps: Steps[] = []

  constructor (
    protected engine: NesoiEngine<any,any,any,any>,
    protected name: string,
    protected dataSource: Source,
    protected buildCallback?: (task: Task<any,any>) => void
  ) {}

  public request<
    Step extends $TaskStep<Client, 'void', {}, any>
  > (
    $: Step
  ) {
    const builder = new TaskStepBuilder('void')
    this.requestStep = $(builder as any) as any
    return this as any as TaskBuilder<
        Client,
        Source,
        ReturnType<Step>,
        Steps
    >
  }

  public step<
    S extends (IsFirstStep extends true ? 'requested' : string),
    Step extends $TaskStep<
      Client,
      S,
      TaskStepEvent<RequestStep> & TaskStepEvent<Steps> & TaskStepExtra<RequestStep> & TaskStepExtra<Steps>,
      any
    >,
    IsFirstStep = Steps extends TaskStepBuilder<any,any,any,any,any> ? false : true
  > (
    state: S,
    $: Step
  ) {
    const builder = new TaskStepBuilder(state)
    const step = $(builder as any)
    this.steps.push(step as any)
    return this as any as TaskBuilder<
        Client,
        Source,
        RequestStep,
        IsFirstStep extends true
          ? ReturnType<Step>
          : (Steps | ReturnType<Step>)
    >
  }

  public build() {
    const task = new Task(this)
    if (this.buildCallback) {
      this.buildCallback(task);
    }
    return task as Task<
      Client,
      Source,
      RequestStep,
      Steps
    >;
  }
}

export type $TaskStep<
  Client,
  State extends string,
  PreviousEvents,
  Event
> =
    ($: TaskStepBuilder<Client, State, PreviousEvents, Event>) =>
      TaskStepBuilder<Client, State, PreviousEvents, Event>