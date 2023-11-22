/**
 * [Cache]
 * 
 * The cache stores the results of idempotent events.
 * Events can either be sent to Resources or Jobs.
 * 
 */

export abstract class CacheSource {
    abstract get(): void
    abstract put(): void
}

export class Cache {

    constructor(
        protected source: CacheSource
    ) {}

    put() {

    }
    
    run() {
        
    }

}