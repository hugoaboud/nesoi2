import { NesoiEngine } from "./engine"
import { Activity, ApplicationStepEvent } from "./engine/operation/activity"

export type Client = {
    user: {
        id: number | string
    }
}

class NesoiActivityClient<
    Engine extends NesoiEngine<any,any>
> {
    constructor(
        protected engine: Engine,
        protected client: NesoiClient<any,any>
    ) {}

    request<
        A extends Activity<any,any>
    >(
        activity: A,
        input: ApplicationStepEvent<A['requestStep']>
    ) {
        return activity.request(this.client, input as never)
    }

    _request(
        activityName: keyof Engine['activities'],
        input: Record<string, any>
    ) {
        const activity = this.engine.activities[activityName];
        return activity.request(this.client, input as never)
    }

    advance<
        A extends Activity<any,any>
    >(
        activity: A,
        id: number,
        input: ApplicationStepEvent<A['steps'][number]>
    ) {
        return activity.advance(this.client, id, input as never)
    }

    _advance(
        activityName: keyof Engine['activities'],
        id: number,
        input: Record<string, any>
    ) {
        const activity = this.engine.activities[activityName];
        return activity.advance(this.client, id, input as never)
    }

    comment<
        A extends Activity<any,any>
    >(
        activity: A,
        id: number,
        comment: string
    ) {
        return activity.comment(this.client, id, comment)
    }

    _comment(
        activityName: keyof Engine['activities'],
        id: number,
        comment: string
    ) {
        const activity = this.engine.activities[activityName];
        return activity.comment(this.client, id, comment)
    }
}

export class NesoiClient<
    Engine extends NesoiEngine<any,any>,
    AppClient extends Client
> {
    public activity: NesoiActivityClient<Engine>

    constructor(
        protected engine: Engine,
        protected client: AppClient,
        public user = client.user
    ) {
        this.activity = new NesoiActivityClient(engine, this)
    }
}