import { createSelector } from "reselect";
import { TASK_STATUSES } from "../constants";

const initialState = {
    tasks: [],
    isLoading: false,
    error: null,
    searchTerm: '',
};

export const getTasks = state => state.tasks.tasks;
export const getSearchTerm = state => state.tasks.searchTerm;

export const getFilteredTasks = createSelector(
    [getTasks, getSearchTerm],
    (tasks, searchTerm) => {
        return tasks.filter(task => task.title.match(new RegExp(searchTerm, 'i')));
    },
);

export const getGroupedAndFilteredTasks = createSelector(
    [getFilteredTasks],
    tasks => {
        const grouped = {};

        TASK_STATUSES.forEach(status => {
            grouped[status] = tasks.filter(task => task.status === status);
        });

        return grouped;
    },
);

export default function tasks(state = initialState, action) {
    switch (action.type) {
        case 'CREATE_TASK': {
            return { tasks: state.tasks.concat(action.payload) };
        }

        case 'FETCH_TASKS_FAILED': {
            return {
                ...state,
                isLoading: false,
                error: action.payload.error,
            };
        }

        case 'EDIT_TASK_SUCCEEDED': {
            const { payload } = action;
            const nextTasks = state.tasks.map(task => {
                if (task.id === payload.task.id) {
                    return payload.task
                }

                return task;
            });
            return {
                ...state,
                tasks: nextTasks,
            };
        }
    
        case 'EDIT_TASK': {
            const { payload } = action;
            return {
                tasks: state.tasks.map(task => {
                    if (task.id === payload.id) {
                        return Object.assign({}, task, payload.params);
                    }
    
                    return task;
                })
            }
        }

        case 'FETCH_TASKS_STARTED': {
            return {
                ...state,
                isLoading: true,
            }
        }
    
        case 'FETCH_TASKS_SUCCEEDED': {
            return {
                ...state,
                isLoading: false,
                tasks: action.payload.tasks,
            };
        }

        case 'CREATE_TASK_SUCCEEDED': {
            return {
                ...state,
                tasks: state.tasks.concat(action.payload.task),
            };
        }

        case 'TIMER_INCREMENT': {
            const nextTasks = state.tasks.map(task => {
                if (task.id === action.payload.taskId) {
                    return {...task, timer: task.timer + 1 };
                }
                return task;
            });

            return {...state, tasks: nextTasks };
        }

        case 'FILTER_TASKS': {
            return { ...state, searchTerm: action.payload.searchTerm };
        }
    
        default: {
            return state;
        }        
    }    
}