import { NesoiClient } from "../../client";
import { ResourceModel } from "./model";

export abstract class DataSource<
    Obj extends { id: number|string }
> {
    
    public $obj: Obj = {} as any

    abstract get(client: NesoiClient<any,any>, id: Obj['id']): undefined | Obj | Promise<undefined | Obj>
    abstract index(client: NesoiClient<any,any>): Obj[] | Promise<Obj[]>
    abstract put(client: NesoiClient<any,any>, model: Omit<Obj, 'id'> | { id: undefined }): Obj | Promise<Obj>
    
}