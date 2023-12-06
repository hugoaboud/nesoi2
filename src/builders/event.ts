import { EventParser } from '../engine/parser/event.parser';
import { $EventParser, EventParserPropFactory, EventParserBuilder } from './parser/event_parser'

/**
 * [ Event ]
 * 
 * A named payload with a known structure that's
 * validated as soon as it's read by the engine.
 * 
 */

export class EventBuilder<
    Parser extends EventParserBuilder = never
> {

    private _alias?: string
    private _allowFrom?: string
    private _parser?: Parser
    
    constructor(
        private name: string
    ) {}

    schema<
        Parser extends EventParserBuilder
    >($: $EventParser<Parser>) {
        this._parser = $(EventParserPropFactory) as any;
        return this as any as EventBuilder<Parser>
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
            Parser
        >(this._alias as any, this._parser as any)
    }

}

export type $Event <
    Parser extends EventParserBuilder
> = ($: EventBuilder) => EventBuilder<Parser>
