import { ResourceModel } from "../data/model"


export type SchedulableState =
    'available' |
    'busy'

export interface SchedulableModel extends ResourceModel {
    id: number,
    state: SchedulableState
}

export type SchedulingState =
    'open' |
    'ongoing' |
    'done'

export interface SchedulingModel extends ResourceModel {
    id: number,
    state: SchedulingState
    schedulable_id: number
    start_timestamp: string
    end_timestamp: string
}