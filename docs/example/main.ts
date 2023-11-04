import { ControllerBuilder } from "../../src/builders/controller"
import { NesoiEngine } from "../../src/engine"

type AliseoClient = {
    user: {
        id: number
        name: string
    }
}

const Nesoi = new NesoiEngine<AliseoClient>()

class DuelModel {
    id!: number
    josefina!: 'sword'|'saber'
}

const Duel = Nesoi.resource('duel', DuelModel)

    .alias('Duelo')

    .event('wow', $ => $
        .schema($ => ({
            opa: {
                aka: $('sdf').date
            }
        }))
        .alias('')
        .allowFrom('')
    )

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

    .transition($ => $
        .on('wow')
        .from('ongoing')
        .with(({ event }) => ({
            kaka: event.opa.aka.alias
        }))
        .andWith(({ event }) => ({
            boboca: event
        }))
        .andWith(({ event }) => ({
            bobjoca: event
        }))
        .to('requested', $ => $
            .given({
                that: ({obj}) => obj.id === 4,
                else: 'Id deve ser igual a 4'
            })
            .andGiven({
                that: ({event}) => event.kaka === 'lala',
                else: 'Kaka deve ser igual a lala'
            })
            .run(({obj, event}) => {
                
            })
            .thenRun(({obj, event}) => {    
                
            })
        )
        .orTo('requested')
    )

type D = typeof Duel['_views']

const job = Nesoi.job('fight', $ => $
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

//

const MailJob = Nesoi.job('MailJob', $ => 
    $.schema($ => ({
        event_id: $('ID do Evento').id(),
        value: $('Valor').float
    }))
    .alias('Enviar E-mail')
)
    .with(({ event }) => ({
        oi : 3
    }))
    .andWith(({ event }) => ({
        tchau : 3
    }))
    
    .given({
        that: ({event}) => event.oi === 3,
        else: () =>'Oi deveria ser 3'
    })

    .run(({event}) => {
        
    })


//

const _controller = new ControllerBuilder()
    .auth('Something')

    .route($ => $
        .withAuth('oi')
        .event($ => ({
            body: $.body(),
            someParam: $.bodyParam('joca.boboca'),
            someHeader: $.header('auth')
        }))
        .toJob(MailJob)
        .toResource(Duel, 'wow')
    )
