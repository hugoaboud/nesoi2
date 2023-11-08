import { ResourceModel } from "./model";

export abstract class DataSource<
    Model extends ResourceModel
> {
    
    abstract get(id: Model['id']): Promise<Model>
    abstract put(model: Model, id?: Model['id']): Promise<void>
    
}