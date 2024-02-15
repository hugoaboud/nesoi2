import { NesoiClient } from "../../client";
import { AnyEngine, NesoiEngine } from "../../engine";
import { NesoiError } from "../../error";
import { NesoiObj } from "./model";
import { AnyView } from "./view";

export abstract class BucketAdapter<
    Obj extends NesoiObj,
    Views extends Record<string, AnyView> = {}
> {
    abstract get(
        client: NesoiClient<any,any>,
        id: Obj['id'],
        view?: keyof Views
    ): Promise<undefined | Obj>
    
    abstract index(
        client: NesoiClient<any,any>,
        view?: keyof Views
    ): Promise<Obj[]>

    abstract put(
        client: NesoiClient<any,any>,
        obj: Omit<Obj, 'id'> | { id: undefined },
        view?: keyof Views
    ): Promise<Obj>
}

type BucketOutput<
    Obj extends NesoiObj,
    Views extends Record<string, AnyView>,
    V extends string|undefined
> = 
    undefined extends V ? Obj : Views[V & string]['#output']

export class Bucket<
    Obj extends NesoiObj,
    Views extends Record<string, AnyView> = {}
> {

    // This allows retrieving the bucket object type
    // from MyBucket['#obj']
    public '#obj': Obj = {} as any
    
    constructor(
        private adapter: BucketAdapter<Obj, Views>,
        private views = {} as Views
    ) {}

    // Bucket actions
    
    public async get<
        V extends (keyof Views & string) | undefined
    >(
        client: NesoiClient<any,any>,
        id: Obj['id'],
        view?: V
    ): Promise<undefined | BucketOutput<Obj, Views, V>> {
        const raw = await this.adapter.get(client, id, view);
        if (!raw) return undefined;
        if (!view) return raw as any;
        return this.build(raw, view) as any;
    }
    
    public async index<
        V extends (keyof Views & string) | undefined
    >(
        client: NesoiClient<any,any>,
        view?: V
    ): Promise<BucketOutput<Obj, Views, V>[]> {
        const raws = await this.adapter.index(client, view)
        if (!raws.length) return [];
        if (!view) return raws as any;
        return this.buildAll(raws, view) as any;
    }

    public async put<
        V extends (keyof Views & string) | undefined
    >(
        client: NesoiClient<any,any>,
        obj: Omit<Obj, 'id'> | { id: undefined },
        view?: V
    ): Promise<BucketOutput<Obj, Views, V>> {
        const raw = await this.adapter.put(client, obj, view)
        if (!view) return raw as any;
        return this.build(raw, view) as any;
    }
    
    async build(obj: Obj, view: keyof Views) {
        return this.views[view].parse(obj);
    }

    async buildAll(objs: Obj[], view: keyof Views) {
        return Promise.all(
            objs.map(obj => this.views[view].parse(obj))
        )
    }
}