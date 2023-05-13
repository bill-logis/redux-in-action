import React, { Component } from 'react';
import { connect } from 'react-redux';
import Header from './components/Header';
import TasksPage from './components/TasksPage';
import {
  createTask,
  editTask,
  fetchProjects,
  filterTasks,
  setCurrentProjectId,
} from './actions';
import FlashMessage from './components/FlashMessage';
import { getGroupedAndFilteredTasks, getProjects } from './reducers';

class App extends Component {
  componentDidMount() {
    this.props.dispatch(fetchProjects());
  }

  onCreateTask = ({ title, description }) => {
    this.props.dispatch(createTask({ title, description }));
  };

  onStatusChange = (id, status) => {
    this.props.dispatch(editTask(id, { status }));
  };

  onSearch = (e) => {
    this.props.dispatch(filterTasks(e));
  };

  onCurrentProjectChange = (e) => {
    this.props.dispatch(setCurrentProjectId(Number(e.target.value)));
  };

  render() {
    return (
      <div className="container">
        {this.props.error && <FlashMessage message={this.props.error} />}
        <div className="main-content">
          <Header
            projects={this.props.projects}
            onCurrentProjectChange={this.onCurrentProjectChange}
          />
          <TasksPage
            tasks={this.props.tasks}
            onCreateTask={this.onCreateTask}
            onSearch={this.onSearch}
            onStatusChange={this.onStatusChange}
            isLoading={this.props.isLoading}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { isLoading, error } = state.projects;

  return {
    tasks: getGroupedAndFilteredTasks(state),
    projects: getProjects(state),
    currentProjectId: state.page.currentProjectId,
    isLoading,
    error,
  };
}

export default connect(mapStateToProps)(App);
