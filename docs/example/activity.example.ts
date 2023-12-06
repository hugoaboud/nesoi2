import { MoveCoilActivity } from "./activity.example.base"
import { Nesoi } from "./activity.example.nesoi"

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
  
  await client.activity.advance(MoveCoilActivity, activity2.id, {
    lala: false
  })
  console.log(activity2)
  
  await client.activity._advance('move_coil', activity1.id, {
    lala: true
  })
  console.log(activity1)

  await client.activity.comment(MoveCoilActivity, activity2.id, 'Something happened!')

  await client.activity._comment('move_coil', activity1.id, 'Something else happened!')
  
  const activities = await MoveCoilActivity.dataSource.activities.index()
  console.log(activities)

  const logs = await MoveCoilActivity.dataSource.logs.index()
  console.log(logs)
  
  // MoveCoilActivity.advance({
  //   bdaola: true,
  //   gaga: 3
  // })

}
main()