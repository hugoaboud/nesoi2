/**
 * [ Controller ]
 * 
 * A public entry point for resources, jobs and custom methods
 * 
 */

import { EventParserBuilder } from "./parser/event_parser";
import { $HttpParser, HttpParserTree } from "./parser/http_parser";

// Resource

export class ControllerRouteBuilder<
    Event extends EventParserBuilder,
    Extra = unknown,
    Action = unknown
> {

    private _auth?: string

    constructor(
        private route: string
    ) {}

    withAuth(auth: string) {
        this._auth = auth;
        return this;
    }

    event<
        Tree extends HttpParserTree
    >($: $HttpParser<Tree>) {
        return this;
    }

    toJob(job: any) {
        return this;
    }
    
    toResource(resource: any, event: any) {
        return this;
    }
    
}

export class ControllerBuilder<
    Extra = unknown,
    Action = unknown
> {

    private _auth?: string

    constructor() {}

    auth(auth: string) {
        this._auth = auth;
        return this;
    }

    route<
        Event extends EventParserBuilder
    >($: $ControllerRoute<Event>) {
        return this;
    }

}

export type $ControllerRoute<
    Event extends EventParserBuilder
> = ($: ControllerRouteBuilder<Event>) => ControllerRouteBuilder<any>