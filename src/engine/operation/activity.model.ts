import { ResourceModel } from "../data/model"

export type ActivityState =
    'requested' |
    'done' |
    'canceled'

export interface ActivityModel extends ResourceModel {
    id: number,
    state: ActivityState
}