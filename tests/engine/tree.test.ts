import { Tree } from '../../src/engine/tree'

const treeMock = {
    prop1: 'value1',
    prop2: 'value9',
    group1: {
        prop1: 'value3',
        prop2: 'value9',
        group2: {
            prop1: 'value5',
            prop2: 'value9'
        }
    }
}

describe('Tree', () => {

    describe('find by key', () => {

        it('should find existing root node by key', () => {       
            const node = Tree.find(treeMock, key => key === 'prop1');
            expect(node).toBeDefined();
            expect(node?.path).toBe('prop1');
            expect(node?.key).toBe('prop1');
            expect(node?.value).toBe('value1');
        })
    
        it('should not find missing root node by key', () => {       
            const node = Tree.find(treeMock, key => key === 'prop3');
            expect(node).not.toBeDefined();
        })
    
        it('should find depth=1 existing node by key', () => {       
            const node = Tree.find(treeMock, key => key === 'group1.prop1');
            expect(node).toBeDefined();
            expect(node?.path).toBe('group1.prop1');
            expect(node?.key).toBe('prop1');
            expect(node?.value).toBe('value3');
        })
    
        it('should not find depth=1 missing node by key', () => {       
            const node = Tree.find(treeMock, key => key === 'group1.prop3');
            expect(node).toBeUndefined();
        })
    
        it('should find depth=2 existing node by key', () => {       
            const node = Tree.find(treeMock, key => key === 'group1.group2.prop1');
            expect(node).toBeDefined();
            expect(node?.path).toBe('group1.group2.prop1');
            expect(node?.key).toBe('prop1');
            expect(node?.value).toBe('value5');
        })
    
        it('should not find depth=2 missing node by key', () => {       
            const node = Tree.find(treeMock, key => key === 'group1.group2.prop3');
            expect(node).toBeUndefined();
        })

    })

    describe('find by value', () => {

        it('should find existing root node by value', () => {       
            const node = Tree.find(treeMock, (_,value) => value === 'value1');
            expect(node).toBeDefined();
            expect(node?.path).toBe('prop1');
            expect(node?.key).toBe('prop1');
            expect(node?.value).toBe('value1');
        })
    
        it('should not find missing root node by value', () => {       
            const node = Tree.find(treeMock, (_,value) => value === 'value0');
            expect(node).not.toBeDefined();
        })
    
        it('should find depth=1 existing node by value', () => {       
            const node = Tree.find(treeMock, (_,value) => value === 'value3');
            expect(node).toBeDefined();
            expect(node?.path).toBe('group1.prop1');
            expect(node?.key).toBe('prop1');
            expect(node?.value).toBe('value3');
        })
        
        it('should find depth=2 existing node by value', () => {       
            const node = Tree.find(treeMock, (_,value) => value === 'value5');
            expect(node).toBeDefined();
            expect(node?.path).toBe('group1.group2.prop1');
            expect(node?.key).toBe('prop1');
            expect(node?.value).toBe('value5');
        })
    
    })

    describe('findAll by key', () => {

        it('should find many root nodes by key', () => {       
            const nodes = Tree.findAll(treeMock, key => key.includes('prop1'));
            expect(nodes).toHaveLength(3);
            nodes.map(node => {
                expect(node?.key).toContain('prop1');
            })
        })

        it('should find many root nodes by value', () => {       
            const nodes = Tree.findAll(treeMock, (_, value) => value === 'value9');
            expect(nodes).toHaveLength(3);
            nodes.map(node => {
                expect(node?.value).toBe('value9');
            })
        })
    
    })

    

})