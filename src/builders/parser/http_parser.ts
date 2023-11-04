/**
 * [ HttpParser ]
 * 
 * A schema for validating events.
 * 
*/

type HttpParserRule = (...args: any) => boolean

export type HttpParserProp<T> = {
    origin: 'body'|'headers'
    path?: string
    default?: T
}

export type HttpParserTree = {
    [_: string]: HttpParserPropBuilder<any> | HttpParserTree
}

export type HttpParserSchema = {
    [_: string]: HttpParserProp<any> | HttpParserSchema
}

export type HttpParserSchemaFromTree<
    Tree extends HttpParserTree
> = {
    [K in keyof Tree]: Tree[K] extends HttpParserPropBuilder<infer X>
        ? HttpParserProp<X>
        : Tree[K] extends HttpParserTree
            ? HttpParserSchemaFromTree<Tree[K]>
            : never
}

class HttpParserPropBuilder<T> {

    private _default?: T = undefined

    constructor(
        private origin: string,
        private path?: string,
    ) {}

    default(value?: T) {
        this._default = value;
        return this;
    }
    
}

export class HttpParserPropFactory {

    body() {
        return new HttpParserPropBuilder<object>('body')
    }

    bodyParam(path: string) {
        return new HttpParserPropBuilder<any>('body', path)
    }

    header(name?: string) {
        return new HttpParserPropBuilder<string>('body', name)
    }
}

export type $HttpParser<Tree extends HttpParserTree> = ($: HttpParserPropFactory) => HttpParserPropBuilder<object> | Tree