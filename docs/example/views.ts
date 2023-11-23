import { ResourceBuilder, ResourceBuilderToSchema } from "../../src/builders/resource/resource"
import { DataSource } from "../../src/data/data_source"
import { ResourceModel } from "../../src/data/model"

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

    async put(data: MockModel, id?: number) {}

}

const mock = new ResourceBuilder('mock', MockDataSource)
    .alias('Mock!')
    .view('default', $ => ({
        id: $.model('id'),
        momo: $.model('mo'),
        dada: $.model('da')
    }))
    .view('id_only', $ => ({
        id: $.model('id')
    }))
    .view('moda', $ => ({
        moda: $.computed(model => model.mo + model.da)
    }))
    .build()

async function main() {
    const res = await mock.readOne(123);
    console.log(res);
    const res2 = await mock.readOne(123, 'id_only');
    console.log(res2);
    const res3 = await mock.readOne(123, 'moda');
    console.log(res3);
}
main()