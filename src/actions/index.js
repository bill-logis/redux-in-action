import * as api from '../api';

export function fetchTasks() {
    return {
        type: 'FETCH_TASKS_STARTED',
    };
}

function fetchTasksFailed(error) {
    return {
        type: 'FETCH_TASKS_FAILED',
        payload: {
            error,
        },
    };
}

function progressTimerStart(taskId) {
    return { type: 'TIMER_STARTED', payload: { taskId } };
}

function progressTimerStop(taskId) {
    return { type: 'TIMER_STOPPED', payload: { taskId } };
}

function createTaskSucceeded(task) {
    return {
        type: 'CREATE_TASK_SUCCEEDED',
        payload: {
            task,
        },
    };
}

export function createTask({ title, description, status = 'Unstarted' }) {
    return dispatch => {
        api.createTask({ title, description, status }).then(resp => {
            dispatch(createTaskSucceeded(resp.data));
        });
    };
}

export function editTaskSucceeded(task) {
    return {
        type: 'EDIT_TASK_SUCCEEDED',
        payload: {
            task,
        },
    };
}

export function editTask(id, params = {}) {
    return (dispatch, getState) => {
        const task = getTaskById(getState().tasks.tasks, id);
        const updatedTask = {
            ...task, 
            ...params
        };

        api.editTask(id, updatedTask ).then(resp => {
            dispatch(editTaskSucceeded(resp.data));
            if (resp.data.status === 'In Progress') {
                return dispatch(progressTimerStart(resp.data.id));
            }

            if (task.status === 'In Progress') {
                return dispatch(progressTimerStop(resp.data.id));
            }
        });
    };
}

function getTaskById(tasks, id) {
    return tasks.find(task => task.id === id);
}

export function fetchTasksSucceeded(tasks) {
    return {
        type: 'FETCH_TASKS_SUCCEEDED',
        payload: {
            tasks
        }
    }
}

export function filterTasks(searchTerm) {
    return { type: 'FILTER_TASKS', payload: { searchTerm } };
}