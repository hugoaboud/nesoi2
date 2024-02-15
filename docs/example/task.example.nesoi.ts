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
  tasks: [
    'lala.move_coil'
  ],
  buckets: {
    'fireball': FireballBucket
  }
})