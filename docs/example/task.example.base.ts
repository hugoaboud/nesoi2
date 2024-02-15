import { TaskSource } from "../../src/builders/operation/task"
import { MemoryBucket } from "../../src/engine/data/memory.bucket"
import { ScheduleModel } from "../../src/engine/operation/schedule.model"
import { TaskLogModel, TaskModel } from "../../src/engine/operation/task.model"
import { Nesoi } from "./task.example.nesoi"

class TaskBucket extends MemoryBucket<TaskModel> {}
class TaskLogBucket extends MemoryBucket<TaskLogModel<any>> {}
class ScheduleBucket extends MemoryBucket<ScheduleModel> {}

const source = new TaskSource(
  new TaskBucket(),
  new TaskLogBucket(),
  new ScheduleBucket()
)

// request
//    - before: -
//    - while: Solicitado
//    - 

export const MoveCoilTask = Nesoi.task('lala.move_coil', source)

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
      .alias({
        state: 'Solicitado',
        done: 'Movido',
        action: 'Mover',
      })
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
      .log(({ input }) => `Bobina ${input.origin_coil} movida com sucesso`)
    )

    .step('preparing', $ => $
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