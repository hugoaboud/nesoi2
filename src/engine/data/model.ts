export type ResourceId = number | string

export interface NesoiObj {
    id: ResourceId
}

export interface ResourceObj extends NesoiObj {
    id: ResourceId
    state: string
    created_by: number|string
    updated_by: number|string
    created_at: string
    updated_at: string
}