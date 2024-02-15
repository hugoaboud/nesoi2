import { ResourceObj } from "../../src/engine/data/model";
import { MemoryBucket } from "../../src/engine/data/memory.bucket";
import { NesoiEngine } from "../../src/engine";
import { BucketBuilder } from "../../src/builders/data/bucket";

type FireballState =
    'idle' |
    'charging' |
    'launched' |
    'boom'

export interface Fireball extends ResourceObj {
    id: number,
    state: FireballState
    power: number,
    size: number
}

export const FireballBucket = new BucketBuilder(MemoryBucket<Fireball>)
    .build({
        1: {
            id: 1,
            state: 'idle' as const,
            power: 10,
            size: 10,
            created_by: 0,
            updated_by: 0,
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z'
        },
        2: {
            id: 2,
            state: 'charging' as const,
            power: 11,
            size: 31,
            created_by: 0,
            updated_by: 0,
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z'
        },
        3: {
            id: 3,
            state: 'launched' as const,
            power: 12,
            size: 32,
            created_by: 0,
            updated_by: 0,
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z'
        },
        4: {
            id: 4,
            state: 'boom' as const,
            power: 13,
            size: 33,
            created_by: 0,
            updated_by: 0,
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z'
        },
    });
    
async function main() {
    const nesoi = new NesoiEngine({
        $client: {} as any,
        buckets: {
            'fireball': FireballBucket
        }
    })   
    const client = nesoi.client({})
    const fireballs = await FireballBucket.index(client)
    console.log(fireballs)
}
main()