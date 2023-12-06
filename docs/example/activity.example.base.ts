import { ActivitySource } from "../../src/builders/operation/activity"
import { MemoryDataSource } from "../../src/engine/data/memory.datasource"
import { ActivityLogModel, ActivityModel } from "../../src/engine/operation/activity.model"
import { SchedulingModel } from "../../src/engine/operation/scheduling.model"
import { Nesoi } from "./activity.example.nesoi"

class ActivityDataSource extends MemoryDataSource<ActivityModel> {}
class ActivityLogDataSource extends MemoryDataSource<ActivityLogModel<any>> {}
class SchedulingDataSource extends MemoryDataSource<SchedulingModel> {}

const source = new ActivitySource(
  new ActivityDataSource(),
  new ActivityLogDataSource(),
  new SchedulingDataSource()
)

export const MoveCoilActivity = Nesoi.activity('move_coil', source)

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