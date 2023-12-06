import { Resource } from "./resource";
import { EventSchema } from "./schema";

interface QueueItem {
    event: EventSchema
    input: Record<string, any>
    target: {
        type: 'resource'|'job'
        obj: Resource<any,any,any>
    }
}
export abstract class QueueSource {
    abstract get(): QueueItem | null
    abstract put(item: QueueItem): void
}

export class Queue {

    constructor(
        protected source: QueueSource
    ) {}

    run() {

    }

}