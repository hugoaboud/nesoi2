import { TaskSource } from "../../src/builders/operation/task"
import { MemoryDataSource } from "../../src/engine/data/memory.datasource"
import { SchedulingModel } from "../../src/engine/operation/scheduling.model"
import { TaskLogModel, TaskModel } from "../../src/engine/operation/task.model"
import { Nesoi } from "./task.example.nesoi"

class TaskDataSource extends MemoryDataSource<TaskModel> {}
class TaskLogDataSource extends MemoryDataSource<TaskLogModel<any>> {}
class SchedulingDataSource extends MemoryDataSource<SchedulingModel> {}

const source = new TaskSource(
  new TaskDataSource(),
  new TaskLogDataSource(),
  new SchedulingDataSource()
)

export const MoveCoilTask = Nesoi.task('move_coil', source)

    .request($ => $
      .event($ => ({
        origin_coil: $('Bobina do Origem').int,
        target_coil: $('Bobina do Destino').int
      }))
      .with(() => ({
        banana: 3
      }))
      .with(({ event }) => ({
        okokok: event.banana
      }))
      .given({
        that: ({ event }) => event.banana === 3,
        else: 'Banana não é 3'
      })
      .do(() => {
        return {}
      })
    )

    .step('requested', $ => $
      .event($ => ({
        req: $('Req').boolean
      }))
      .given({
        that: () => true,
        else: ''
      })
      .do(() => {
        return {
          flocos: 'de neve'
        }
      })
    )

    .step('moved', $ => $
      .event($ => ({
        peq: $('Peq').boolean,
        lolo: $('Lolo').float
      }))
      .do(({ client }) => {
        // client.task._execute('unfuel', {

        // })
        return {}
      })
    )

    .build()

// MoveCoilTask.request({} as any, {
//   origin_coil: 3,
//   target_coil: 4  
// })


// MoveCoilTask.comment({} as any, 3, 'Hello!')

// MoveCoilTask.execute({} as any, {

// })

// MoveCoilTask.schedule({} as any, 3, {}, '2023-04-05T05:34:50', '2023-04-05T05:34:50')