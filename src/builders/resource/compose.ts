/**
 * [ States ]
 * 
 * The states of a resource.
 * 
*/

import { ResourceObj } from "../../engine/data/obj"

type ComposeFn<
    ParentModel extends ResourceObj,
    ChildModel extends ResourceObj
> = () => ChildModel

export type Composition<
    ParentModel extends ResourceObj,
    ChildModel extends ResourceObj
> = {
    self: string
    other: string
    read: ComposeFn<ParentModel, ChildModel>
}

export class CompositionBuilder<
    ParentModel extends ResourceObj,
    ChildModel extends ResourceObj
> {
    
    private __type = 'compose';
    private read!: ComposeFn<ParentModel, ChildModel>

    constructor(
        private self: string,
        private other: string
    ) {
        this.where(self+'_id' as any);
    }

    from(self_fkey: keyof ParentModel) {
        this.read = () => ({} as never)
    }
    
    where(other_fkey: keyof ChildModel) {
        this.read = () => ({} as never)
    }
}

export type $Composition<
    ParentModel extends ResourceObj,
    ChildModel extends ResourceObj
> = ($: CompositionBuilder<ParentModel,ChildModel>) => void