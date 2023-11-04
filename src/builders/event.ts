import { $EventParser, EventParserSchemaFromTree, EventParserPropFactory, EventParserSchema, EventParserTree } from './parser/event_parser'

/**
 * [ Event ]
 * 
 * A named payload with a known structure that's
 * validated as soon as it's read by the engine.
 * 
 */

export type EventSchema = { [_: string]: EventParserSchema }

export class EventBuilder<
    Schema = unknown
> {

    private _alias?: string
    private _allowFrom?: string
    private _schema?: Schema
    
    constructor(
        private name: string
    ) {}

    schema<
        Tree extends EventParserTree
    >($: $EventParser<Tree>) {
        this._schema = $(EventParserPropFactory) as any;
        type S = EventParserSchemaFromTree<Tree>
        return this as any as EventBuilder<S>
    }

    alias(alias: string) {
        this._alias = alias;
        return this
    }
    
    allowFrom(allowFrom: string) {
        this._allowFrom = allowFrom;
        return this
    }

}

export type $Event <
    Schema extends EventParserSchema
> = ($: EventBuilder) => EventBuilder<Schema>
