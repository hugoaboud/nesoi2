export type ResourceId = number | string

export interface NesoiObj {
    id: ResourceId
    state: string
}

export interface ResourceObj extends NesoiObj {
    id: ResourceId
    state: string
}