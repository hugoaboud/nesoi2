import { ResourceModel } from "../engine/data/model";

export type ResourceMethod<
    Client,
    Model extends ResourceModel,
    Event,
    Response
> = (ctx: {
    client: Client,
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
  Input,
  Response
> = (ctx: {
  id?: number,
  client: Client,
  event: Event,
  input: Input 
}) => Response | Promise<Response>