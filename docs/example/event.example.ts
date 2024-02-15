import { EventBuilder } from "../../src/builders/event"
import { NesoiClient } from "../../src/client"

import { NesoiEngine } from "../../src/engine"
import { FireballBucket } from "./bucket.example"

type MyClient = {
  user: {
      id: number
      name: string
  },
  trx: {}
}

export const Nesoi = new NesoiEngine({
  $client: {} as MyClient,
  sources: { 
    'fireball': FireballBucket
  }
})

const FireballEvent = Nesoi.event('fireball')
    .schema($ => ({
        size: $('Tamanho').float,
        power: $('Poder').int,
        glacial: $('Glacial').boolean.optional(),
        powerup: {
            speed: $('Velocidade').int
        },
        points: $('Pontos').int.array(),
        fireball_id: $('ID').id('fireball').array()
    }))
    .alias('Bola de fogo!')
    .build()

async function main() {

    const client = Nesoi.client({user: { id: 1, name: '' }, trx: {}})
    const event = await FireballEvent.parse(client, {
        power: 12.2,
        size: 46,
        powerup: {
            speed: 10
        },
        points: [1, 2, 3],
        fireball_id: [1,33]
    })

    console.log(event)
}

main()