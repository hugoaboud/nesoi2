import { Resource } from "../resource"

// A resource object is the result of a view
// However, it also stores nesoi metadata
export class ResourceObj {

    // This property should not be sent out by controllers
    private _nesoi: {
        resource: Resource<any, any, any>,
        model: Record<string, any>
    }

    constructor(
        resource: Resource<any, any, any>,
        model: Record<string, any>,
        view: Record<string, any>
    ) {
        this._nesoi = { resource, model }
        Object.assign(this, view)
    }

    async save() {
        const { _nesoi, ...obj} = this
        return (this._nesoi.resource as any).dataSource.put(obj)
    }

    log() {
        const { _nesoi, ...obj} = this
        console.log(obj)
    }

}