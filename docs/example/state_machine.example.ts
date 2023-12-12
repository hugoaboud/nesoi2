import { ResourceBuilder } from "../../src/builders/resource/resource"
import { FireballDataSource } from "./datasource.example"

export const Fireball = new ResourceBuilder({} as any, 'fireball', FireballDataSource)
    .alias('Fireball')
    .states($ => ({
        idle: $('Idle').initial(),
        charging: $('Charging').children({
            cold: $('Cold').initial(),
            medium: $('Medium'),
            hot: $('Hot')
        }),
        launched: $('Launched'),
        boom: $('Boom!').final(),
    }))
    .event('charge', $ => $
        .alias('Charge')
        .schema($ => ({
            power: $('Power').float
        }))
    )
    .event('launch', $ => $
        .alias('Launch')
        .schema($ => ({
            direction: $('Direction').enum(['up', 'down', 'left', 'right'] as const)
        }))
    )
    .event('explode', $ => $
        .alias('Explode')
        .schema($ => ({}))
    )
    .transition($ => $
        .on('charge')
        .from('idle')
        .to('boom', $ => $
            .given({
                that: ({ obj }) => obj.size > 5,
                else: 'Fireball too small, can\'t be charged :('
            })
            .given({
                that: ({ event }) => event.power > 10
            })
            .run(() => {
                console.log("CHARGE BOOOM!")
            })
        )
        .orTo('charging')
    )
    .transition($ => $
        .on('launch')
        .from('charging')
        .to('launched')
    )
    .transition($ => $
        .on('explode')
        .from('launched')
        .to('boom')
    )
    .build()

async function main() {
    
    await Fireball.machine.send({} as any, 1, 'charge', {
        power: 8
    })

    await Fireball.machine.send({} as any, 1, 'launch', {
        direction: 'down'
    })

}
main()