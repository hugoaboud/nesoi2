import { ControllerBuilder } from "../../src/builders/controller"
import { DataSource } from "../../src/data/data_source"
import { NesoiEngine } from "../../src/engine"

const Nesoi = new NesoiEngine<{
    user: {
        id: number
        name: string
    }
}>()

class DuelModel {
    id!: number
    state!: string
    josefina!: 'sword'|'saber'
}

class DuelSource extends DataSource<DuelModel> {
    async get() {
        return {} as DuelModel
    }
    async index() {
        return [] as DuelModel[]
    }
    async put(model: DuelModel) {
        
    }
}

const Duel = Nesoi.resource('duel', DuelSource)

    .alias('Duelo')

    .view('asd', $ => ({
        koko: $.model('josefina'),
        ooi: {
            oaoa: $.child('df')
        }
    }))

    .states($ => ({
        requested: $('Requerido').initial(),
        ongoing: $('Em Andamento').children({
            working: $('Trabalhando').initial()
        }),
    }))

    .event('create', $ => $
        .schema($ => ({
            asdasd: {
                asdaska: $('sdf').date,
                lopasa: $('asdasd').boolean
            }
        }))
        .alias('')
        .allowFrom('')
    )

    .event('wow', $ => $
        .schema($ => ({
            opa: {
                aka: $('sdf').date,
                lopa: $('asdasd').boolean
            }
        }))
        .alias('')
        .allowFrom('')
    )

    .event('wow2', $ => $
        .schema($ => ({
            opopa: {
                aka: $('sdf').date,
                lopa: $('asdasd').boolean
            }
        }))
        .alias('')
        .allowFrom('')
    )

    .transition($ => $
        .on('wow2')
        .from('ongoing')
        .with(({ event }) => ({
            kaka: 'akoaok' as const
        }))
        .andWith(({ event }) => ({
            boboca: event.kaka
        }))
        .andWith(({ event }) => ({
            bobjoca: event.boboca
        }))
        .to('requested', $ => $
            .given({
                that: ({obj}) => obj.id === 4,
                else: 'Id deve ser igual a 4'
            })
            .andGiven({
                that: ({event}) => event.opopa as any === 'lala',
                else: 'Kaka deve ser igual a lala'
            })
            .run(({obj, event}) => {
                event.bobjoca
            })
            .thenRun(({obj, event}) => {    
                
            })
        )
        .orTo('.')
    )

type D = typeof Duel['_events']


const DuelJob = Nesoi.job('fight', $ => $
    .alias('LETSFIGHT!')    
    .schema($ => ({
        bacteria: $('Bactéria').float
    }))
)
    .with(({}) => ({
        folo: 123
    }))
    .andWith(({}) => ({
        fafolo: 'popopo' as const
    }))
    .andWith(({ event }) => ({
        po: event.fafolo
    }))
    .andWith(({ event }) => ({
        apo: event.po
    }))

    .given({
        that: ({}) => false,
        else: 'Oh no!'
    })
    .andGiven({
        that: ({}) => false,
        else: 'Ohh nooo!'
    })

    .run(({event}) => {
        event.apo
    })

const _controller = new ControllerBuilder()
    .auth('Something')

    .route($ => $
        .withAuth('oi')
        .event($ => ({
            body: $.body(),
            someParam: $.bodyParam('joca.boboca'),
            someHeader: $.header('auth')
        }))
        .toJob(DuelJob)
        .toResource(Duel, 'wow')
    )
