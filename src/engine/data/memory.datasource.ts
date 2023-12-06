import { DataSource } from "./datasource";
import { ResourceModel } from "./model";

export class MemoryDataSource<
    T extends { id: number | string }
> extends DataSource<T> {

    protected data: Record<number, T> = {}

    index() {
        const objs = [];
        for (const id in this.data) {
            objs.push(this.data[id])
        }
        return Promise.resolve(objs)
    }

    get(id: number) {
        return Promise.resolve(this.data[id]);
    }

    put(obj: T | { id: undefined }) {
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