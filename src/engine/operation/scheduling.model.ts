import { ResourceObj } from "../data/obj"


export type SchedulableState =
    'available' |
    'busy'

export interface SchedulableModel extends ResourceObj {
    id: number,
    state: SchedulableState
}

export type SchedulingState =
    'open' |
    'ongoing' |
    'done'

export interface SchedulingModel extends ResourceObj {
    id: number,
    state: SchedulingState
    schedulable_id: number
    start_timestamp: string
    end_timestamp: string
}