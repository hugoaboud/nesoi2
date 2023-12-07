import { NesoiError } from "../error"

type ElseFn = (...args: any) => string | Promise<string>

type AnyCondition = {
    that: (...args: any) => boolean | Promise<boolean>,
    else?: string | ElseFn
}

export class Condition {

    static async check(condition: AnyCondition, methodArgs: any) {
        const promise = condition.that(methodArgs)
        const res = await Promise.resolve(promise)
        if (!res) {
            if (typeof condition.that === 'string') {
                throw NesoiError.Condition(condition.that)
            }       
            const elseFn = condition.else as ElseFn
            const err_promise = elseFn(methodArgs)
            const res = await Promise.resolve(err_promise)
            throw NesoiError.Condition(res);
        }
    }

}