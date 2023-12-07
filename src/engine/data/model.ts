export type ResourceId = number | string

export interface NesoiModel {
    id: ResourceId
}

export interface ResourceModel extends NesoiModel {
    id: ResourceId
    state: string
}