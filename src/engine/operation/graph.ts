import { Client, NesoiClient } from "../../client";
import { NesoiError } from "../../error";
import { Bucket } from "../data/bucket";
import { NesoiDate } from "../date";
import { TaskGraphLog } from "./graph.model";
import { TaskModel } from "./task.model";

export class TaskGraph {

    affectedTasks: Record<number, TaskModel> = {}
    logs: TaskGraphLog[] = []

    constructor(
        public client: NesoiClient<any,any>,
        public dataSource: Bucket<TaskModel>,
        public task: TaskModel
    ) {
        this.affectedTasks[task.id] = task;
        if (!task.graph.links) {
            task.graph.links = []
        }
    }

    private async getTask(id: number) {
        const task = await this.dataSource.get(this.client, id)
        if (!task) {
            throw NesoiError.Task.IDNotFound(id)
        }
        if (!task.graph.links) {
            task.graph.links = []
        }
        return task;
    }

    // Parent/Child/Related

    public async linkParent(taskId: number) {
        const task = await this.getTask(taskId);
        this._addChildOf(this.task, task);
        this._addParentOf(task, this.task);
    }
    
    private _addChildOf(from: TaskModel, to: TaskModel) {
        if (from.graph.links?.some(link =>
            link.relation === 'child_of' && link.task_id === to.id)) {
            return
        }
        from.graph.links?.push({
            relation: 'child_of',
            task_id: to.id,
            created_by: this.client.user.id,
            created_at: NesoiDate.isoNow()
        })
        this.logs.push({
            type: 'link',
            from_task_id: from.id,
            to_task_id: to.id,
            relation: 'child_of'
        })
        this.affectedTasks[from.id] = from
    }

    public async linkChild(taskId: number) {
        const task = await this.getTask(taskId);
        this._addParentOf(this.task, task);
        this._addChildOf(task, this.task);
    }

    private _addParentOf(from: TaskModel, to: TaskModel) {
        if (from.graph.links?.some(link =>
            link.relation === 'parent_of' && link.task_id === to.id)) {
            return
        }
        from.graph.links?.push({
            relation: 'parent_of',
            task_id: to.id,
            created_by: this.client.user.id,
            created_at: NesoiDate.isoNow()
        })
        this.logs.push({
            type: 'link',
            from_task_id: from.id,
            to_task_id: to.id,
            relation: 'parent_of'
        })
        this.affectedTasks[from.id] = from
    }

    public async unlinkChild(taskId: number) {
        const task = await this.getTask(taskId);
        this._removeParentOf(this.task, task);
        this._removeChildOf(task, this.task);
    }

    private _removeParentOf(from: TaskModel, to: TaskModel) {
        from.graph.links?.filter(link => 
            !(link.relation === 'parent_of' && link.task_id === to.id))
        this.logs.push({
            type: 'unlink',
            from_task_id: from.id,
            to_task_id: to.id,
            relation: 'parent_of'
        })
        this.affectedTasks[from.id] = from
    }

    public async unlinkParent(taskId: number) {
        const task = await this.getTask(taskId);
        this._removeChildOf(this.task, task);
        this._removeParentOf(task, this.task);
    }

    private _removeChildOf(from: TaskModel, to: TaskModel) {
        from.graph.links?.filter(link => 
            !(link.relation === 'child_of' && link.task_id === to.id))
        this.affectedTasks[from.id] = from
    }

    public async linkRelated(taskId: number) {
        const task = await this.getTask(taskId);
        this._addRelatedTo(this.task, task);
        this._addRelatedTo(task, this.task);
    }

    private _addRelatedTo(from: TaskModel, to:TaskModel) {
        if (from.graph.links?.some(link =>
            link.relation === 'relates_to' && link.task_id === to.id)) {
            return
        }
        from.graph.links?.push({
            relation: 'relates_to',
            task_id: to.id,
            created_by: this.client.user.id,
            created_at: NesoiDate.isoNow()
        })
        this.logs.push({
            type: 'link',
            from_task_id: from.id,
            to_task_id: to.id,
            relation: 'relates_to'
        })
        this.affectedTasks[from.id] = from
    }

    public async unlinkRelated(taskId: number) {
        const task = await this.getTask(taskId);
        this._removeRelated(this.task, task);
        this._removeRelated(task, this.task);
    }

    private _removeRelated(from: TaskModel, to: TaskModel) {
        from.graph.links?.filter(link => 
            !(link.relation === 'relates_to' && link.task_id === to.id))
        this.affectedTasks[from.id] = from
    }


}