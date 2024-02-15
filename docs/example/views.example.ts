import { NesoiEngine } from "../../src/engine"
import { MemoryBucket } from "../../src/engine/data/memory.bucket"

interface Fireball {
    id: number
    power: number
    red: number
}

const nesoi = new NesoiEngine({
    $client: {} as any
})   

nesoi.bucket('fireball', MemoryBucket<Fireball>)
    .view('default', $ => ({
        lala: $.model('power')
    }))
    .view('color', $ => ({
        value: $.computed(obj => obj.red)
    }))
    .build() 

async function main() {

    const client = nesoi.client({});

    console.log(client.data.readOne('fireball'))

    await MyBucket.put(client, {
        power: 3,
        red: 15
    })

    await MyBucket.put(client, {
        power: 7,
        red: 19
    })

    const objs = await MyBucket.index(client, 'default')
    
    const obj = await MyBucket.get(client, 1)
    const obj2 = await MyBucket.get(client, 1, 'color')
    const obj3 = await MyBucket.get(client, 1, 'default')
    
    console.log(MyBucket);
    console.log(objs);
    console.log(obj);
    console.log(obj2);
    console.log(obj3);
}
main()