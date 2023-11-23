type TreeNode<T> = {
    path: string
    key: string
    value: T
}

export class Tree {

    static find< P extends any >(
        obj: Record<string, P>,
        fn: (path: string, value: P) => boolean,
        _prefix?: string
    ): TreeNode<P>|undefined {
        for (let key in obj) {
            const prop = obj[key];
            const path = (_prefix ? _prefix + '.' : '') + key;
            if (
                typeof prop === 'object'
                && !Array.isArray(prop)
                && !(prop as any)['__type']
            ) {
                return this.find(prop as any, fn, path);
            }
            if (fn(path, prop as any)) {
                return {
                    path,
                    key,
                    value: prop
                } as TreeNode<P>
            }
        }
    }

    static findAll< P extends any >(
        obj: Record<string, P>,
        fn: (path: string, value: P) => boolean,
        _prefix?: string
    ) {
        const nodes: TreeNode<P>[] = []
        for (let key in obj) {
            const prop = obj[key];
            const path = (_prefix ? _prefix + '.' : '') + key;
            if (
                typeof prop === 'object'
                && !Array.isArray(prop)
                && !(prop as any)['__type']
            ) {
                nodes.push(...this.findAll(prop as any, fn, key));
            }
            if (fn(path, prop as any)) {
                nodes.push({
                    path,
                    key,
                    value: prop
                })
            }
        }
        return nodes;
    }

}