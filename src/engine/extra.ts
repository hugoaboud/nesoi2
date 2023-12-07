import { TaskMethod } from "../builders/method"

export class Extra {

    static async run(extra: TaskMethod<any,any,any,any>, methodArgs: any, target: any) {
        
        const promise = extra(methodArgs)
        const res = await Promise.resolve(promise)
        Object.assign(target, res);
    }

}