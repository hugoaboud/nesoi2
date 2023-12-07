import { ResourceModel } from "../../src/engine/data/model";
import { MemoryDataSource } from "../../src/engine/data/memory.datasource";

type FireballState =
    'idle' |
    'charging' |
    'launched' |
    'boom'

export interface Fireball extends ResourceModel {
    id: number,
    state: FireballState
    power: number,
    size: number
}

export class FireballDataSource extends MemoryDataSource<Fireball> {

    data = {
        1: {
            id: 1,
            state: 'idle' as const,
            power: 10,
            size: 10
        },
        2: {
            id: 2,
            state: 'charging' as const,
            power: 11,
            size: 31
        },
        3: {
            id: 3,
            state: 'launched' as const,
            power: 12,
            size: 32
        },
        4: {
            id: 4,
            state: 'boom' as const,
            power: 13,
            size: 33
        },
    }
}   