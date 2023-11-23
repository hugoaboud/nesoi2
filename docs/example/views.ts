import { ResourceBuilder } from "../../src/builders/resource/resource"
import { DataSource } from "../../src/data/data_source"
import { ResourceModel } from "../../src/data/model"
import { MemoryDataSource } from "../../src/engine/data/memory.datasource"

interface MockModel extends ResourceModel {
    id: number,
    mo: 'ck',
    da: 'ta'
}

class MockDataSource extends MemoryDataSource<MockModel> {

    data = {
        0: {
            id: 0,
            state: 'created',
            mo: 'ck' as const,
            da: 'ta' as const
        },
        1: {
            id: 1,
            state: 'created',
            mo: 'ck' as const,
            da: 'ta' as const
        },
        2: {
            id: 2,
            state: 'created',
            mo: 'ck' as const,
            da: 'ta' as const
        },
        3: {
            id: 3,
            state: 'created',
            mo: 'ck' as const,
            da: 'ta' as const
        },
    }
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
    const res = await mock.readOne(0);
    console.log(res);
    const res2 = await mock.readOne(0, 'id_only');
    console.log(res2);
    const res3 = await mock.readOne(0, 'moda');
    console.log(res3);

    const res4 = await mock.readAll(0);
    console.log(res4);
    const res5 = await mock.readAll(0, 'id_only');
    console.log(res5);
    const res6 = await mock.readAll(0, 'moda');
    console.log(res6);
}
main()