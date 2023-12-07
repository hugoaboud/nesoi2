import { NesoiClient } from "../../client";
import { DataSource } from "./datasource";
import { ResourceObj } from "./obj";

export class MemoryDataSource<
    T extends { id: number | string }
> extends DataSource<T> {

    protected data: Record<number, T> = {}

    index(client: NesoiClient<any,any>) {
        const objs = [];
        for (const id in this.data) {
            objs.push(this.data[id])
        }
        return Promise.resolve(objs)
    }

    get(client: NesoiClient<any,any>, id: number) {
        return Promise.resolve(this.data[id]);
    }

    put(client: NesoiClient<any,any>, obj: T | { id: undefined }) {
        if (!obj.id) {
            const lastId = Object.keys(this.data)
                .map(id => parseInt(id))
                .sort((a,b) => b-a)[0] || 0
                obj.id = lastId+1
        }
        this.data[obj.id as number] = obj as T
        return Promise.resolve(obj as any)
    }

}