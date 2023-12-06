/**
 * [ States ]
 * 
 * The states of a resource.
 * 
*/

import { ResourceModel } from "../../engine/data/model"

type ComposeFn<
    ParentModel extends ResourceModel,
    ChildModel extends ResourceModel
> = () => ChildModel

export type Composition<
    ParentModel extends ResourceModel,
    ChildModel extends ResourceModel
> = {
    self: string
    other: string
    read: ComposeFn<ParentModel, ChildModel>
}

export class CompositionBuilder<
    ParentModel extends ResourceModel,
    ChildModel extends ResourceModel
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
    ParentModel extends ResourceModel,
    ChildModel extends ResourceModel
> = ($: CompositionBuilder<ParentModel,ChildModel>) => void