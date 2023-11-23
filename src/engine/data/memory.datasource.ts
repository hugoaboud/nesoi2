import { DataSource } from "../../data/data_source";
import { ResourceModel } from "../../data/model";

export class MemoryDataSource<
    T extends ResourceModel
> extends DataSource<T> {

    protected data: Record<number, T> = {}

    index() {
        const objs = [];
        for (const id in this.data) {
            objs.push(this.data[id])
        }
        return objs
    }

    get(id: number) {
        return this.data[id];
    }

    put(obj: T | { id: undefined }) {
        if (!obj.id) {
            const lastId = Object.keys(this.data)
                .map(id => parseInt(id))
                .sort((a,b) => b-a)[0] || 0
                obj.id = lastId+1
        }
        this.data[obj.id as number] = obj as T
    }

}