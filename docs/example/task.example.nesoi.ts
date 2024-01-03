import { NesoiEngine } from "../../src/engine"

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
  sources: {}
})