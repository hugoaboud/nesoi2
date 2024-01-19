import { NesoiClient } from "../../client";
import { BucketAdapter } from "./bucket";
import { NesoiObj } from "./model";

export class MemoryBucket<
    Obj extends NesoiObj
> extends BucketAdapter<Obj> {

    constructor(
        private data: Record<Obj['id'], Obj> = {} as any
    ) {
        super();
    }

    index(client: NesoiClient<any,any>): Promise<Obj[]> {
        const objs = [];
        for (const id in this.data) {
            objs.push(this.data[id as Obj['id']])
        }
        return Promise.resolve(objs)
    }

    get(client: NesoiClient<any,any>, id: Obj['id']): Promise<Obj|undefined> {
        return Promise.resolve(this.data[id]);
    }

    put(client: NesoiClient<any,any>, obj: Obj | { id: undefined }): Promise<Obj> {
        if (!obj.id) {
            const lastId = Object.keys(this.data)
                .map(id => parseInt(id))
                .sort((a,b) => b-a)[0] || 0
                obj.id = lastId+1
        }
        this.data[obj.id as Obj['id']] = obj as Obj
        return Promise.resolve(obj as any)
    }

}