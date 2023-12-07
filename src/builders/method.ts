import { ResourceModel } from "../engine/data/model";

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

export type TaskMethod<
  Client,
  Event,
  Request,
  Response
> = (ctx: {
  client: Client,
  event: Event,
  request: Request 
}) => Response | Promise<Response>