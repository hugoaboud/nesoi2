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
        protected engine: Engine
    ) {}

    request<
        A extends Activity<any>
    >(
        activity: A,
        input: ApplicationStepEvent<A['requestStep']>
    ) {
        return activity.request(this, input as never)
    }

    _request(
        activityName: keyof Engine['activities'],
        input: Record<string, any>
    ) {
        const activity = this.engine.activities[activityName];
        return activity.request(this, input as never)
    }

    advance<
        A extends Activity<any>
    >(
        activity: A,
        id: number,
        input: ApplicationStepEvent<A['steps'][number]>
    ) {
        return activity.advance(this, id, input as never)
    }

    _advance(
        activityName: keyof Engine['activities'],
        id: number,
        input: Record<string, any>
    ) {
        const activity = this.engine.activities[activityName];
        return activity.advance(this, id, input as never)
    }
}

export class NesoiClient<
    Engine extends NesoiEngine<any,any>,
    AppClient extends Client
> {
    constructor(
        protected engine: Engine,
        protected client: AppClient,
        public activity: NesoiActivityClient<Engine> = new NesoiActivityClient(engine),
        public user = client.user
    ) {}
}