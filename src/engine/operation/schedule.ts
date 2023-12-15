import { EventBuilder } from "../../builders/event"
import { NesoiEngine } from "../../engine"
import { DataSource } from "../data/datasource"
import { NesoiDate } from "../date"
import { ScheduleModel } from "./schedule.model"

export const ScheduleResource = (
    Nesoi: NesoiEngine<any,any,any,any>,
    dataSource: DataSource<ScheduleModel>
) =>
    Nesoi.resource('task.schedule', dataSource)
        .alias('Task Schedule')
        .states($ => ({
            scheduled: $('Scheduled').initial(),
            // negotiating: $('Negotiating'),
            ongoing: $('Ongoing'),
            done: $('Done').final(),
            canceled: $('Canceled').final()
        }))

        // Create

        .create($ => $
            .event($ => ({
                task_id: $('Task ID').int,
                schedulable_id: $('Schedulable ID').int,
                start_datetime: $('Start').datetime,
                end_datetime: $('End').datetime
            }))
            .parse(({ event }) => ({
                ...event,
                start_datetime: event.start_datetime.iso,
                end_datetime: event.end_datetime.iso,
                outcome: {}
            }))
        )

        // Events

        .event('start', $ => $
            .alias('Iniciar')
            .schema($ => ({}))
        )

        .event('end', $ => $
            .alias('Iniciar')
            .schema($ => ({}))
        )

        // Transitions

        .transition($ => $
            .on('start')
            .from('scheduled')
            .to('ongoing', $ => $
                .run(({ obj, client }) => {
                    obj.outcome.start = {
                        user: {
                            id: client.user.id,
                            name: client.user.name
                        },
                        timestamp: NesoiDate.isoNow()
                    }
                })
            )
        )
        .transition($ => $
            .on('end')
            .from('ongoing')
            .to('done', $ => $
                .run(({ obj, client }) => {
                    obj.outcome.end = {
                        user: {
                            id: client.user.id,
                            name: client.user.name
                        },
                        timestamp: NesoiDate.isoNow()
                    }
                })
            )
        )
        .build()
