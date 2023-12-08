import { ResourceModel } from "../data/model"

export type TaskAction =
    'request'
    | 'advance'
    | 'execute'
    | 'comment'

export type TaskState =
    'scheduled'
    | 'requested'
    | 'done'
    | 'canceled'

export interface TaskModel {
    id: number
    state: TaskState
    request: Record<string, any>
    outcome: Record<string, any>
    graph: Record<string, any>
    created_by: number|string
    updated_by: number|string
    created_at: any
    updated_at: any
}

export interface TaskLogModel<Event> {
    id: number
    task_id: number
    task_type: string
    action: TaskAction
    state: TaskState
    message: string
    event?: Event
    timestamp: string
    user: number | string
    created_by: number|string
    updated_by: number|string
    created_at: any
    updated_at: any
}