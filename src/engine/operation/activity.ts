import { EventParser } from "../parser/event.parser";
import { ActivityCondition } from "../../builders/condition";
import { ActivityMethod } from "../../builders/method";
import { ActivitySource, ActivityStepBuilder } from "../../builders/operation/activity";
import { ActivityLogModel, ActivityModel } from "./activity.model";
import { DataSource } from "../data/datasource";
import { NesoiError } from "../../error";
import { NesoiClient } from "../../client";

export type ApplicationStepEvent<T> = T extends ActivityStepBuilder<any,any,infer X,any,any> ? X : never

export class ActivityStep {
    public state: string
    public eventParser: EventParser<any>
    public conditions: ActivityCondition<any, any>[]
    public fn: ActivityMethod<any, any, any>

    constructor (builder: any) {
        this.state = builder.state
        this.eventParser = new EventParser('', builder.eventParser)
        this.conditions = builder.conditions
        this.fn = builder.fn
    }
}

export class Activity<
    Client extends NesoiClient<any,any>,
    Source extends ActivitySource<any,any,any> = never,
    RequestStep = unknown,
    Steps = unknown
> {

    public dataSource: Source
    public name: string
    public requestStep!: ActivityStep & RequestStep
    public steps!: (ActivityStep & Steps)[]

    constructor(builder: any) {
        this.dataSource = builder.dataSource
        this.name = builder.name
        this.requestStep = builder.requestStep.build()
        this.steps = builder.steps.map(
            (step: any) => step.build()
        )
    }

    public async request(
        client: Client,
        input: ApplicationStepEvent<RequestStep>
    ) {
        const event = await this.requestStep.eventParser.parse(input as any);
        const entry: Omit<ActivityModel, 'id'> = {
            state: 'requested'
        }
        const activity = await this.dataSource.activities.put(entry)
        await this.logStep(client, activity, event);
        return activity;
    }

    // public schedule(
    //     input: StepEvent<RequestStep>,
    //     start_timestamp: string,
    //     end_timestamp: string
    // ) {}

    public async advance(
        client: Client,
        id: number,
        input: ApplicationStepEvent<Steps>
    ) {
        const activity = await this.dataSource.activities.get(id)
        if (!activity) {
            throw NesoiError.Activity.NotFound(this.name, id)
        }
        const { current, next } = this.getStep(activity.state)
        if (!current) {
            throw NesoiError.Activity.InvalidState(this.name, id, activity.state)
        }
        const event = await current.eventParser.parse(input as any);
        const result = await Promise.resolve(
            current.fn({ client, event })
        )
        if (result === 'canceled') {
            activity.state = 'canceled';
        }
        else if (result === 'pass') {
            if (next) {
                activity.state = next.state as any
            }
            else {
                activity.state = 'done'
            }
        }
        await this.logStep(client, activity, event);
        await this.dataSource.activities.put(activity)
        return activity
    }

    public async comment(
        client: Client,
        id: number,
        comment: string
    ) {
        const activity = await this.dataSource.activities.get(id)
        if (!activity) {
            throw NesoiError.Activity.NotFound(this.name, id)
        }
        const log: Omit<ActivityLogModel<any>, 'id'> = {
            activity_id: activity.id,
            type: 'comment',
            state: activity.state,
            message: comment,
            timestamp: new Date().toISOString(),
            user_id: client.user.id
        }
        await this.dataSource.logs.put(log)
    }

    private getStep(state: string) {
        const index = this.steps.findIndex(step => step.state === state);
        return {
            current: this.steps[index],
            next: this.steps[index+1]
        }
    }

    private async logStep<Event>(client: Client, activity: ActivityModel, event: Event) {
        const log: Omit<ActivityLogModel<any>, 'id'> = {
            activity_id: activity.id,
            type: 'step',
            state: activity.state,
            message: `Activity advanced to state ${activity.state}`,
            event,
            timestamp: new Date().toISOString(),
            user_id: client.user.id
        }
        await this.dataSource.logs.put(log)
    }
}
