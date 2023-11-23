import { ResourceBuilder } from "../../src/builders/resource/resource"
import { DataSource } from "../../src/data/data_source"
import { ResourceModel } from "../../src/data/model"

interface MockModel extends ResourceModel {
    id: number,
    mo: 'ck'|'boom',
    da: 'ta'
}

class MockDataSource extends DataSource<MockModel> {

    async get(id: number) {
        return {
            id,
            state: ['idle','charging','launched','boom'][id],
            mo: 'ck' as const,
            da: 'ta' as const
        }
    }

    async index() {
        return [
            await this.get(0),
            await this.get(1),
            await this.get(2),
            await this.get(3)
        ]
    }

    async put(data: MockModel, id?: number) {}

}

const Mock = new ResourceBuilder('mock', MockDataSource)
    .alias('Mock!')
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
            direction: $('Direction').enum(['up', 'down', 'left', 'right'])
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
                that: ({ obj }) => obj.mo === 'boom',
                else: 'Mo is boom, boom!'
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
    
    Mock.machine.send(0, 'charge', {
        power: 12
    })

}
main()