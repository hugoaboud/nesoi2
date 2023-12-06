/**
 * [ Condition ]
 * 
 * A condition for a transition target
 * 
*/

import { ResourceModel } from "../engine/data/model";
import { ActivityMethod, JobMethod, ResourceMethod } from "./method";

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

export type ActivityCondition<
  Client,
  Event
> = {
  that: ActivityMethod<Client, Event, boolean>,
  else: string | ActivityMethod<Client, Event, string>
}