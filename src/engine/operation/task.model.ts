import { ResourceObj } from "../data/obj"

export type TaskState =
    'scheduled' |
    'requested' |
    'done' |
    'canceled'

export interface TaskModel {
    id: number,
    state: TaskState
}

export interface TaskLogModel<Event> {
    id: number,
    task_id: number,
    type: 'step' | 'comment',
    state: string,
    message: string,
    event?: Event,
    timestamp: string,
    user_id: number | string
}