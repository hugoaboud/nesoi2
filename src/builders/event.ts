import { EventParser } from '../engine/parser/event.parser';
import { $EventParser, EventParserSchemaFromTree, EventParserPropFactory, EventParserSchema, EventParserTree } from './parser/event_parser'

/**
 * [ Event ]
 * 
 * A named payload with a known structure that's
 * validated as soon as it's read by the engine.
 * 
 */

export class EventParserBuilder<
    Schema extends EventParserSchema = never
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
        return this as any as EventParserBuilder<S>
    }

    alias(alias: string) {
        this._alias = alias;
        return this
    }
    
    allowFrom(allowFrom: string) {
        this._allowFrom = allowFrom;
        return this
    }

    build() {
        return new EventParser<
            Schema
        >(this)
    }

}

export type $Event <
    Schema extends EventParserSchema
> = ($: EventParserBuilder) => EventParserBuilder<Schema>
