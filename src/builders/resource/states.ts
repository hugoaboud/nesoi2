/**
 * [ States ]
 * 
 * The states of a resource.
 * 
*/

export type State = {
    alias: string
    _initial: boolean
    _final: boolean
    _states: StateTree
}

export type StateTree = {
    [_: string]: StateBuilder
}

export type StateSchema = {
    [_: string]: State
}

export class StateBuilder {
    
    private _initial = false;
    private _final = false;
    private _states: StateTree = {};

    constructor(
        private alias: string
    ) {}

    initial() {
        this._initial = true;
        return this
    }

    final() {
        this._final = true;
        return this
    }

    children(states: StateTree) {
        Object.assign(this._states, states);
        return this
    }

}

export function StateFactory(alias: string) {
    return new StateBuilder(alias);
}

export type $States<
    Tree extends StateTree
> = ($: typeof StateFactory) => Tree