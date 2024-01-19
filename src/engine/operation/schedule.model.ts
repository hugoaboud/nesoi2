import { ResourceObj } from "../data/model"

export interface SchedulableModel extends ResourceObj {
    id: number
}

export type ScheduleState =
    'negotiating' |
    'scheduled' |
    'ongoing' |
    'done' |
    'canceled'

export type ScheduleOutcome = {
    start?: {
        user: { id: number|string, name: string },
        timestamp: string
    }
    end?: {
        user: { id: number|string, name: string },
        timestamp: string
    }
}

export interface ScheduleModel extends ResourceObj {
    id: number,
    state: ScheduleState
    task_id: number
    schedulable_id: number
    start_datetime: string
    end_datetime: string
    outcome: ScheduleOutcome
    created_by: number|string
    updated_by: number|string
    created_at: any
    updated_at: any
}

export type ScheduleEventType = {
    schedulable_id: number,
    start_datetime: string,
    end_datetime: string
}