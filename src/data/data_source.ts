import { ResourceModel } from "./model";

export abstract class DataSource<
    Model extends ResourceModel
> {
    
    abstract get(id: Model['id']): Model | Promise<Model>
    abstract put(model: Model, id?: Model['id']): void | Promise<void>
    
}