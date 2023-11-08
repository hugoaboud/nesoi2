import { ResourceBuilder, ResourceBuilderToSchema } from "../../src/builders/resource/resource"
import { DataSource } from "../../src/data/data_source"
import { ResourceModel } from "../../src/data/model"
import { StateMachine } from "../../src/engine/state_machine"

interface MockModel extends ResourceModel {
    id: number,
    mo: 'ck',
    da: 'ta'
}

class MockDataSource extends DataSource<MockModel> {

    async get(id: number) {
        return {
            id,
            mo: 'ck' as const,
            da: 'ta' as const
        }
    }

    async put(data: MockModel, id?: number) {
        
    }

}

const builder = new ResourceBuilder('mock', MockDataSource)
    .alias('Mock!')
    .states($ => ({
        idle: $('Parado').initial(),
        moving: $('Movendo'),
        broken: $('Quebrado').final()
    }))
    .event('create', $ => $
        .alias('Criar')
        .schema($ => ({
            size: $('Tamanho').float,
            color: $('Cor').enum()
        }))
    )
    .event('edit', $ => $
        .alias('Criar')
        .schema($ => ({
            size: $('Tamanho').float,
            color: $('Cor').enum()
        }))
    )

const machine = new StateMachine(
    'my_machine',
    builder as any as ResourceBuilderToSchema<typeof builder>
)

machine.send(4, 'create', {} as any)