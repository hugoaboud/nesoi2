import { ResourceModel } from "./model";

export abstract class DataSource<
    Model extends { id: number|string }
> {
    
    abstract get(id: Model['id']): undefined | Model | Promise<undefined | Model>
    abstract index(): Model[] | Promise<Model[]>
    abstract put(model: Omit<Model, 'id'> | { id: undefined }): Model | Promise<Model>
    
}