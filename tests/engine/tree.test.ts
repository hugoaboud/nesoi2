import { Tree } from '../../src/helpers/tree'

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

    describe('find by path', () => {

        it('should find existing root node by path', () => {       
            const node = Tree.find(treeMock, path => path === 'prop1');
            expect(node).toBeDefined();
            expect(node?.path).toBe('prop1');
            expect(node?.key).toBe('prop1');
            expect(node?.value).toBe('value1');
        })
    
        it('should not find missing root node by path', () => {       
            const node = Tree.find(treeMock, path => path === 'prop3');
            expect(node).not.toBeDefined();
        })
    
        it('should find depth=1 existing node by path', () => {       
            const node = Tree.find(treeMock, path => path === 'group1.prop1');
            expect(node).toBeDefined();
            expect(node?.path).toBe('group1.prop1');
            expect(node?.key).toBe('prop1');
            expect(node?.value).toBe('value3');
        })
    
        it('should not find depth=1 missing node by path', () => {       
            const node = Tree.find(treeMock, path => path === 'group1.prop3');
            expect(node).toBeUndefined();
        })
    
        it('should find depth=2 existing node by path', () => {       
            const node = Tree.find(treeMock, path => path === 'group1.group2.prop1');
            expect(node).toBeDefined();
            expect(node?.path).toBe('group1.group2.prop1');
            expect(node?.key).toBe('prop1');
            expect(node?.value).toBe('value5');
        })
    
        it('should not find depth=2 missing node by path', () => {       
            const node = Tree.find(treeMock, path => path === 'group1.group2.prop3');
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

    describe('findAll', () => {

        it('should find many root nodes by path', () => {       
            const nodes = Tree.findAll(treeMock, path => path.includes('prop1'));
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