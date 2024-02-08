import { TaskModel } from "./task.model"

export const TaskGraphRelation = {
    relates_to: {
        alias: 'é relacionado a'
    },
    child_of: {
        alias: 'é filha de'
    },
    parent_of: {
        alias: 'é pai de'
    }
}


export type TaskGraphRelation = keyof typeof TaskGraphRelation

export type TaskGraph = {
    root?: TaskModel,
    links?: {
        relation: TaskGraphRelation
        task_id: number
        created_by: number | string
        created_at: string
    }[]
}

export type TaskGraphLog = {
    type: 'link'|'unlink',
    from_task_id: number,
    to_task_id: number,
    relation: TaskGraphRelation
}