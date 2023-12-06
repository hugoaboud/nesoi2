import { ActivityBuilder, ActivityStepBuilder } from "../../src/builders/operation/activity"
import { NesoiEngine } from "../../src/engine"
import { MemoryDataSource } from "../../src/engine/data/memory.datasource"
import { Activity } from "../../src/engine/operation/activity"
import { ActivityModel } from "../../src/engine/operation/activity.model"

type MyClient = {
  user: {
      id: number
      name: string
  }
}

const Nesoi = new NesoiEngine({
  client: {} as MyClient,
  activities: [
    'move_coil'
  ]
})

export const ActivityDataSource = new class extends MemoryDataSource<ActivityModel> {
    data = {
        1: {
            id: 1,
            state: 'requested' as const
        },
        2: {
            id: 2,
            state: 'done' as const
        },
        3: {
            id: 3,
            state: 'canceled' as const
        },
    }
}()

const MoveCoilActivity = Nesoi.activity('move_coil', ActivityDataSource)

  .request($ => $
    .event($ => ({
      origin_coil: $('Bobina de Origem').id(),
      target_coil: $('Bobina de Destino').id(),
    }))
    .with(({ event }) => ({
      koko: event.origin_coil,
      lala: 3,
    }))
    .with(({ event, client }) => ({
      kakaka: client.user.id,
      popo: event.koko,
    }))
    .given({
      that: ({ event }) => event.origin_coil === 'oi',
      else: 'Ué',
    })
    .do(({ event }) => {
      event.popo
      return 'pass'
    })
  )

  .step('requested', $ => $
    .event($ => ({
      lala: $('lala').boolean
    }))
    .do(({ event }) => {
      event.lala
      return 'pass'
    })
  )

  .step('bola', $ => $
    .event($ => ({
      bdaola: $('bdaola').boolean,
      gaga: $('gaga').int
    }))
    .with(() => ({
      aloalo: 3
    }))
    .do(({ event }) => {
      event.bdaola
      return 'pass'
    })
  )

  .step('bfola', $ => $
    .event($ => ({
      bdaofla: $('bdaofla').boolean
    }))
    .do(({ event }) => {
      event.bdaofla
      return 'pass'
    })
  )

  .build()

async function main() {

  const client = Nesoi.client({
    user: {
      id: 1,
      name: 'Joãozin'
    }
  })

  const activity1 = await MoveCoilActivity.request(client, {
    origin_coil: 3,
    target_coil: 'oi'
  })
  console.log(activity1)

  const activity2 = await client.activity.request(MoveCoilActivity, {
    origin_coil: 3,
    target_coil: 2
  })
  console.log(activity2)

  await client.activity._advance('move_coil', activity1.id, {
    lala: true
  })
  console.log(activity1)
  
  await client.activity._advance('move_coil', activity2.id, {
    lala: false
  })
  console.log(activity2)
  
  await client.activity._advance('move_coil', activity2.id, {
    
  })
  console.log(activity2)
  
  // MoveCoilActivity.advance({
  //   bdaola: true,
  //   gaga: 3
  // })

}
main()