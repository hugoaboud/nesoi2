import { ResourceObj } from "../engine/data/obj";

export type ResourceMethod<
    Model extends ResourceObj,
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
  Input,
  Response
> = (ctx: {
  client: Client,
  event: Event,
  input: Input 
}) => Response | Promise<Response>