import { ResourceModel } from "../data/model"

export type ActivityState =
    'scheduled' |
    'requested' |
    'done' |
    'canceled'

export interface ActivityModel {
    id: number,
    state: ActivityState
}

export interface ActivityLogModel<Event> {
    id: number,
    activity_id: number,
    type: 'step' | 'comment',
    state: string,
    message: string,
    event?: Event,
    timestamp: string,
    user_id: number | string
}