export abstract class QueueSource {
    abstract get(): void
    abstract put(): void
}

export class Queue {

    constructor(
        protected source: QueueSource
    ) {}

    put() {

    }
    
    run() {
        
    }

}