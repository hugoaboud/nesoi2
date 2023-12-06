import { EventParser } from "../parser/event.parser";
import { ActivityCondition } from "../../builders/condition";
import { ActivityMethod } from "../../builders/method";
import { ActivityStepBuilder } from "../../builders/operation/activity";
import { ActivityModel } from "./activity.model";
import { DataSource } from "../data/datasource";
import { NesoiError } from "../../error";

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
    Client,
    Source = unknown,
    RequestStep = unknown,
    Steps = unknown
> {

    public dataSource: DataSource<ActivityModel> & Source
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
        const parsedInput = await this.requestStep.eventParser.parse(input as any);
        const activity: Omit<ActivityModel, 'id'> = {
            state: 'requested'
        }
        return this.dataSource.put(activity)
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
        const activity = await this.dataSource.get(id)
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
        await this.dataSource.put(activity)
        return activity
    }

    private getStep(state: string) {
        const index = this.steps.findIndex(step => step.state === state);
        return {
            current: this.steps[index],
            next: this.steps[index+1]
        }
    }

}
