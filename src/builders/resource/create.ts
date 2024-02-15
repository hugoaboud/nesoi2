/**
 * [ Create ]
 * 
 * The constructor of a resource
 * 
*/

import { ResourceObj } from "../../engine/data/model"
import { EventParser } from "../../engine/parser/event.parser"
import { EventBuilder } from "../event"
import { ResourceMethod } from "../method"
import { $EventParser, EventOutputFromParser, EventParserBuilder, EventParserPropFactory } from "../parser/event_parser"

export class ResourceCreateBuilder<
    Model extends ResourceObj,
    Event extends EventParserBuilder = never
> {
    
    protected _event!: Event
    protected _method!: ResourceMethod<any, any, any, any>

    constructor(
        protected name: string
    ) {}

    event<
        Parser extends EventParserBuilder
    >($: $EventParser<Parser>) {
        this._event = $(EventParserPropFactory) as any;
        return this as any as ResourceCreateBuilder<Model, Parser>
    }

    parse($: ResourceMethod<any,Model,EventOutputFromParser<Event>,Record<string, any>>) {
        this._method = $
        return this
    }

    build() {
        const event = new EventBuilder({} as any, this.name+'.create')
        return {
            event: new EventParser<Event>('Criar', this._event as any),
            method: this._method
        }
    }

}

export type $ResourceCreate<
    Model extends ResourceObj,
    Parser extends EventParserBuilder
> =
    ($: ResourceCreateBuilder<Model>) =>
        ResourceCreateBuilder<Model, Parser>