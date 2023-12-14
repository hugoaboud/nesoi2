export type ResourceId = number | string

export interface NesoiModel {
    id: ResourceId
}

export interface ResourceModel extends NesoiModel {
    id: ResourceId
    state: string
    created_by: number|string
    updated_by: number|string
    created_at: string
    updated_at: string
}