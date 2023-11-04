import { ResourceModel } from "../model";

export type ResourceMethod<
    Model extends ResourceModel,
    Event,
    Response
> = (ctx: {
    obj: Model
    event: Event
}) => Response | Promise<Response>

export type JobMethod<
    Event,
    Response
> = (ctx: {
    event: Event
}) => Response | Promise<Response>