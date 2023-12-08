import { NesoiEngine } from "../../src/engine"

type MyClient = {
  user: {
      id: number
      name: string
  }
}

export const Nesoi = new NesoiEngine({
  $client: {} as MyClient,
  tasks: [
    'move_coil'
  ],
  sources: {}
})