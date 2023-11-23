import { ResourceBuilder } from "../../src/builders/resource/resource"
import { FireballDataSource } from "./datasource.example"

export const Fireball = new ResourceBuilder({} as any, 'mock', FireballDataSource)
    .alias('Fireball!')
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
                that: ({ obj }) => obj.power > 12,
                else: 'Power is too great, boom!'
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
    
    Fireball.machine.send(0, 'launch', {
        direction: 'down'
    })

}
main()