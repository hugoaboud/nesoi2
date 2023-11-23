import { DataSource } from "../../data/data_source"

// A resource object is the result of a view
// However, it also stores nesoi metadata
export class ResourceObj {

    // This property should not be sent out by controllers
    private _nesoi: {
        dataSource: DataSource<any>,
        model: Record<string, any>
    }

    constructor(
        dataSource: DataSource<any>,
        model: Record<string, any>,
        view: Record<string, any>
    ) {
        this._nesoi = { dataSource, model }
        Object.assign(this, view)
    }

    async save() {
        return this._nesoi.dataSource.put(this)
    }

}