import { MoveCoilTask } from "./task.example.base"
import { Nesoi } from "./task.example.nesoi"

async function main() {

  const oldClient = {
    user: {
      id: 3,
      name: 'Joao'
    },
    trx: {}
  }

  const client = Nesoi.client(oldClient)

  const task1 = await MoveCoilTask.request(client, {
    origin_coil: 3,
    target_coil: 5
  })
  console.log(task1)

  const task2 = await client.task.request(MoveCoilTask, {
    origin_coil: 3,
    target_coil: 2
  })
  console.log(task2)
  
  await client.task.advance(MoveCoilTask, task2.id, {
    req: true
  })
  console.log(task2)
  
  await client.task._advance('move_coil', task1.id, {
    req: true
  })
  console.log(task1)

  await client.task.comment(MoveCoilTask, task2.id, 'Something happened!')

  await client.task._comment('move_coil', task1.id, 'Something else happened!')
  
  await MoveCoilTask.execute(client, {
    origin_coil: 3,
    target_coil: 2,
    peq: true,
    lolo: 3,
    req: true
  })


  const task3 = await MoveCoilTask.schedule(client, 0, '2023-12-14T23:04:53.441Z', '2023-12-15T23:04:53.441Z', {
    origin_coil: 3,
    target_coil: 5
  })
  console.log(task3)

  const task4 = await client.task.schedule(MoveCoilTask, 0, '2023-12-14T23:04:53.441Z', '2023-12-15T23:04:53.441Z', {
    origin_coil: 3,
    target_coil: 2
  })
  console.log(task4)

  const tasks = await MoveCoilTask.dataSource.tasks.index(client)
  console.log(tasks)

  const logs = await MoveCoilTask.dataSource.logs.index(client)
  console.log(logs)

  const schedules = await MoveCoilTask.dataSource.schedules.index(client)
  console.log(schedules)
  
  // MoveCoilTask.advance(client, 4, {
  //   bdaola: true,
  //   gaga: 3
  // })

}
main()