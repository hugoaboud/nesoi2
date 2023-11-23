import { ResourceModel } from "./model";

export abstract class DataSource<
    Model extends ResourceModel
> {
    
    abstract get(id: Model['id']): undefined | Model | Promise<undefined | Model>
    abstract index(): Model[] | Promise<Model[]>
    abstract put(model: Model | { id: undefined }): void | Promise<void>
    
}