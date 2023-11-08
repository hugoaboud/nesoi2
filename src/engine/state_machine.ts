// import { EventSchema } from "../builders/event";
// import { ResourceBuilder, ResourceBuilderToSchema, ResourceSchema } from "../builders/resource/resource";
// import { StateSchema } from "../builders/resource/states";
// import { TransitionSchema } from "../builders/resource/transition";
// import { DataSource } from "../data/data_source";
// import { ResourceId, ResourceModel } from "../data/model";
// import { Tree } from "./tree";

// type ModelId<Schema> = Schema extends ResourceSchema<infer X, any> ? X['id'] : never

// export class StateMachine<
//     Schema extends ResourceSchema<any, any>,
//     Events = Schema['_events'],
//     Transitions = Schema['']
// >{

//     private initialState: string
//     private finalStates: string[]
    
//     private transitions: Record<string, TransitionSchema[]>

//     private source

//     constructor(
//         private name: string,
//         private schema: Schema
//     ) {

//         // Get initial state from states schema
//         const initialNode = Tree.find(schema._states, (_, value) => value._initial);
//         if (!initialNode) {
//             throw new Error(`[StateMachine] ${name} has no initial state`)
//         }
//         this.initialState = initialNode.key;

//         // Get final states from states schema
//         this.finalStates = Tree.findAll(schema._states, (_, value) => value._final)
//                                 .map(node => node.key);

//         // Create data source
//         this.source = new schema.dataSourceClass()
//     }

//     async send<
//         E extends keyof Events
//     >(id: ModelId<Schema>, event: E, data: Events[E]) {

//         const obj = await this.source.get(id);

        

//     }
// }
