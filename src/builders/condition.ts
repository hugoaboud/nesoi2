/**
 * [ Condition ]
 * 
 * A condition for a transition target
 * 
*/

import { ResourceObj } from "../engine/data/model";
import { TaskMethod, JobMethod, ResourceMethod } from "./method";

export type ResourceCondition<
    Client,
    Model extends ResourceObj,
    Event
> = {
    that: ResourceMethod<Client, Model, Event, boolean>,
    else?: string | ResourceMethod<Client, Model, Event, string>
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