/**
 * [ Condition ]
 * 
 * A condition for a transition target
 * 
*/

import { ResourceModel } from "../engine/data/model";
import { TaskMethod, JobMethod, ResourceMethod } from "./method";

export type ResourceCondition<
    Model extends ResourceModel,
    Event
> = {
    that: ResourceMethod<Model, Event, boolean>,
    else?: string | ResourceMethod<Model, Event, string>
}

export type JobCondition<
    Event
> = {
    that: JobMethod<Event, boolean>,
    else: string | JobMethod<Event, string>
}

export type TaskCondition<
  Client,
  Event,
  Input
> = {
  that: TaskMethod<Client, Event, Input, boolean>,
  else: string | TaskMethod<Client, Event, Input, string>
}