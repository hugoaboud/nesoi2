import { ResourceModel } from "../data/model"

export type TaskAction =
    'request' |
    'advance' |
    'execute' |
    'comment'

export type TaskState =
    'scheduled' |
    'requested' |
    'done' |
    'canceled'

export interface TaskModel {
    id: number,
    state: TaskState,
    request: Record<string, any>
    outcome?: Record<string, any>
}

export interface TaskLogModel<Event> {
    id: number,
    task_id: number,
    task_type: string,
    action: TaskAction,
    state: TaskState,
    message: string,
    event?: Event,
    timestamp: string,
    user_id: number | string
}