import * as api from '../api';

export const SET_CURRENT_PROJECT_ID = 'SET_CURRENT_PROJECT_ID';
export function setCurrentProjectId(id) {
  return {
    type: 'SET_CURRENT_PROJECT_ID',
    payload: {
      id,
    },
  };
}

export const FETCH_PROJECTS_STARTED = 'FETCH_PROJECTS_STARTED';
function fetchProjectsStarted(boards) {
  return { type: FETCH_PROJECTS_STARTED, payload: { boards } };
}

export const FETCH_PROJECTS_FAILED = 'FETCH_PROJECTS_FAILED';
function fetchProjectsFailed(err) {
  return { type: FETCH_PROJECTS_FAILED, payload: err };
}

function fetchProjectsSucceeded(projects) {
  return { type: 'FETCH_PROJECTS_SUCCEEDED', payload: { projects } };
}

export function fetchProjects() {
  return (dispatch, getState) => {
    dispatch(fetchProjectsStarted());

    return api
      .fetchProjects()
      .then((resp) => {
        const projects = resp.data;

        // const normalizedData = normalize(projects, [projectSchema]);

        dispatch(fetchProjectsSucceeded(projects));

        // Pick a board to show on initial page load
        if (!getState().page.currentProjectId) {
          const defaultProjectId = projects[0].id;
          dispatch(setCurrentProjectId(defaultProjectId));
        }
      })
      .catch((err) => {
        fetchProjectsFailed(err);
      });
  };
}

// TODO: do these get migrated over to fetchBoard
export function fetchTasksStarted() {
  return {
    type: 'FETCH_TASKS_STARTED',
  };
}

export function fetchTasksSucceeded() {
  return {
    type: 'FETCH_TASKS_SUCCEEDED',
  };
}

export function fetchTasks(boardId) {
  return (dispatch) => {
    return api.fetchTasks(boardId).then((resp) => {
      dispatch(fetchTasksSucceeded(resp.data));
    });
  };
}

function createTaskSucceeded(task) {
  return {
    type: 'CREATE_TASK_SUCCEEDED',
    payload: {
      task,
    },
  };
}

export function createTask({
  projectId,
  title,
  description,
  status = 'Unstarted',
}) {
  return (dispatch, getState) => {
    api.createTask({ title, description, status, projectId }).then((resp) => {
      dispatch(createTaskSucceeded(resp.data));
    });
  };
}

function editTaskSucceeded(task) {
  return {
    type: 'EDIT_TASK_SUCCEEDED',
    payload: {
      task,
    },
  };
}

export function editTask(task, params = {}) {
  return (dispatch, getState) => {
    const updatedTask = {
      ...task,
      ...params,
    };
    api.editTask(task.id, updatedTask).then((resp) => {
      dispatch(editTaskSucceeded(resp.data));

      // if task moves into "In Progress", start timer
      if (resp.data.status === 'In Progress') {
        return dispatch(progressTimerStart(resp.data.id));
      }

      // if tasks move out of "In Progress", stop timer
      if (task.status === 'In Progress') {
        return dispatch(progressTimerStop(resp.data.id));
      }
    });
  };
}

function progressTimerStart(taskId) {
  return { type: 'TIMER_STARTED', payload: { taskId } };
}

function progressTimerStop(taskId) {
  return { type: 'TIMER_STOPPED', payload: { taskId } };
}

export function filterTasks(searchTerm) {
  return { type: 'FILTER_TASKS', payload: { searchTerm } };
}
