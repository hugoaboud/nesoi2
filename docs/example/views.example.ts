import { ResourceBuilder } from "../../src/builders/resource/resource"
import { FireballDataSource } from "./datasource.example";

const mock = new ResourceBuilder({} as any, 'mock', FireballDataSource)
    .alias('Mock!')
    .view('id_only', $ => ({
        id: $.model('id')
    }))
    .view('sizepower', $ => ({
        sizepower: $.computed(model => model.size + model.power)
    }))
    .build()

async function main() {
    const res = await mock.readOne(0);
    res.log()
    const res2 = await mock.readOne(0, 'id_only');
    res2.log()
    const res3 = await mock.readOne(0, 'sizepower');
    res3.log()

    const res4 = await mock.readAll(0);
    console.log(res4)
    const res5 = await mock.readAll(0, 'id_only');
    console.log(res5)
    const res6 = await mock.readAll(0, 'sizepower');
    console.log(res6)
}
main()