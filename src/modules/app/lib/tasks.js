import ObservableMap from "./ObservableMap";

let instance;

class TaskManager {
  constructor() {
    if (instance) {
      throw new Error("Task Manager is a singleton class. Use getInstance() instead.");
    }

    /** @type {ObservableMap<string, Task>} */
    this.taskMap = new ObservableMap();
    this._order = [];
    this._lastTimestamp = 0;
    this._counter = 0;
    instance = this;

    // Sync order array with map changes
    this.taskMap.addCallback((action, key) => {
      switch (action) {
        case 'set':
          if (!this._order.includes(key)) {
            this._order.push(key);
          }
          break;
        case 'delete':
          this._order = this._order.filter(id => id !== key);
          break;
        case 'clear':
          this._order = [];
          break;
      }
    });
  }

  /**
   * Creates a new task with sortable ID
   * @param {Object} [initialData] - Initial task data
   * @returns {string} Generated task ID
   */
  createTask(initialData = {name: "Default Task"}) {
    const taskId = this._generateId();
    const task = {
      id: taskId,
      data: initialData,
      createdAt: new Date(),
      isCompleted: false
    };
    
    this.taskMap.set(taskId, task);
    return taskId;
  }

  /**
   * Get the most recently created task
   * @returns {Task|null}
   */
  getLatestTask() {
    if (this.taskMap.size === 0) return null;
    const sortedIds = Array.from(this.taskMap.keys()).sort();
    return this.taskMap.get(sortedIds[sortedIds.length - 1]);
  }

  /**
   * Get a task by ID
   * @param {string} taskId 
   * @returns {Task|undefined}
   */
  getTask(taskId) {
    return this.taskMap.get(taskId);
  }

  /**
   * Delete a task by ID
   * @param {string} taskId 
   * @returns {boolean}
   */
  deleteTask(taskId) {
    return this.taskMap.delete(taskId);
  }

  /**
   * Get all tasks in current order
   * @returns {Task[]}
   */
  getOrderedTasks() {
    return this._order.map(id => this.taskMap.get(id)).filter(Boolean);
  }

  /**
   * Toggle task completion status
   * @param {string} taskId 
   */
  toggleTaskCompletion(taskId) {
    const task = this.taskMap.get(taskId);
    if (task) {
      task.isCompleted = !task.isCompleted;
      this.taskMap.set(taskId, task); // Trigger update
    }
  }

  // Other existing methods (reorderTask, clearAllTasks, etc.)

  _generateId() {
    const now = Date.now();
    
    if (now !== this._lastTimestamp) {
      this._lastTimestamp = now;
      this._counter = 0;
    }

    const timestampStr = now.toString().padStart(15, '0');
    const counterStr = (++this._counter).toString().padStart(4, '0');
    
    return `${timestampStr}_${counterStr}`;
  }
}

const taskManager = Object.freeze(new TaskManager());
export default taskManager;

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {Object} data
 * @property {Date} createdAt
 * @property {boolean} isCompleted
 */