import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {isMobile} from 'utils/environment.es6'
import {changeLocation} from 'actions/site.es6'
import {ProjectsUrls} from 'constants/Urls.es6'
import {forwardActiveProjectTask, activeProjectTaskDetailsUpdated, updateActiveProjectTaskUserLink, updateActiveProjectTask, changeActiveProjectTaskDetailsViewMode} from 'actions/projects.es6'
import messages from 'messages/projects.es6'


class ProjectTaskDetailsButtons extends Component {

    onTaskStatusButton(status){
        var {dispatch, project, task, user} = this.props
        dispatch(updateActiveProjectTask(task, {status: status, jssid: '1234'}))
    }

    renderTaskStatusButtons(){
        const {dispatch, environment, task, project, user, isProjectActive} = this.props;

        if(isProjectActive) {
            if (task.owner_id == user.id && task.status == 'done') {
                return <button onClick={this.onTaskStatusButton.bind(this, 'todo')} className="btn task-status-btn task-todo-btn task-btn btn-primary"><i className="fa fa-check"> </i> {gettext("Reopen")}</button>
            }
        }
    }

    onTaskUserLinkStatusButton(userLink, status, condition=true){
        var {dispatch, project, task, user, projectUserlog} = this.props

        if(!condition){
            return
        }
        var skipTimer = userLink.user.id != user.id || (task.alert_type == 'global' || (userLink && userLink.type != 'task'))
        if(project.checkUserRole(user.id, 'director') || projectUserlog){
            skipTimer = true
        }
        if(!skipTimer) {
            dispatch(changeActiveProjectTaskDetailsViewMode('timer'))
        }else{
            dispatch(updateActiveProjectTaskUserLink(project, userLink, {status: status, jssid: '1234'}, function(updatedTask){
                if(user.id == userLink.user.id){
                    if(status=='progress'){
                        messages.taskInProgress()
                    }
                    if(status=='done'){
                        if(task.alert_type != 'global'){
                            messages.taskDone()
                        }
                    }
                }
            }))
        }
    }

    renderTaskUserLinkStatusButtons(){
        const {dispatch, environment, task, project, user, isProjectActive} = this.props;

        var buttons = []
        var taskLinks = task.getUsers('task')
        var taskUserLink = task.getUser(user.id, ['task', 'info'])
        var statusButtonsVisible = taskUserLink || (task.owner_id == user.id && taskLinks.length == 1)
        var status = taskUserLink ? taskUserLink.status : null

        taskUserLink = taskUserLink ? taskUserLink : taskLinks[0]

        if(!statusButtonsVisible || !isProjectActive){
            return buttons
        }

        if (taskUserLink && taskUserLink.type == 'info') {
            if (status != 'done' && task.owner_id != user.id) {
                buttons.push(<button onClick={this.onTaskUserLinkStatusButton.bind(this, taskUserLink, 'done')} key="curr-user-ok-btn" className="btn user-status-btn curr-user-status-btn curr-user-ok-btn task-btn btn-success"><i className="fa fa-check"> </i> {gettext("Ok")}</button>)
            }
        } else {
            if (status == 'todo' || status == 'pause') {
                buttons.push(<button onClick={this.onTaskUserLinkStatusButton.bind(this, taskUserLink, 'progress')} key="curr-user-progress-btn" className="btn user-status-btn curr-user-status-btn curr-user-progress-btn task-btn btn-danger"><i className="glyphicon"> </i> {gettext("Progress")}</button>)
            }
            if (status == 'progress') {
                buttons.push(
                    <button onClick={this.onTaskUserLinkStatusButton.bind(this, taskUserLink, 'pause')} key="curr-user-pause-btn" className="btn user-status-btn curr-user-status-btn curr-user-pause-btn task-btn btn-danger">
                        <i className="glyphicon glyphicon-pause"> </i> {gettext("Pause")}
                    </button>)
                if (!task.child || task.child.status == 'done') {
                    buttons.push(
                        <button onClick={this.onTaskUserLinkStatusButton.bind(this, taskUserLink, 'done')} key="curr-user-done-btn" className="btn user-status-btn curr-user-status-btn curr-user-done-btn task-btn btn-success">
                            <i className="fa fa-check"> </i> {gettext("Done")}
                        </button>)
                }
            }
            if (status == 'done' && task.owner_id != user.id) {
                buttons.push(<button onClick={this.onTaskUserLinkStatusButton.bind(this, taskUserLink, 'todo')} key="curr-user-reopen-btn" className="btn user-status-btn curr-user-status-btn curr-user-done-btn task-btn btn-primary"><i className="fa fa-check"> </i> {gettext("Reopen")}</button>)
            }
        }

        return buttons
    }
    
    renderTaskForwardButton(){
        const {dispatch, environment, task, project, user, isProjectActive} = this.props;

        if(isProjectActive) {
            if (task.owner_id != user.id && !project.checkUserRole(user.id, 'worker')) {
                var taskUserLink = task.getUser(user.id, ['task'])
                if (!task.child && taskUserLink && taskUserLink.status != 'done' && task.alert_type != 'global') {
                    return <button onClick={this.onTaskForwardButton.bind(this)} className="btn btn-success task-forward-form-btn task-btn"> <i className="glyphicon glyphicon-arrow-right"> </i> {gettext("Forward")}</button>
                }
            }
        }
    }

    onTaskForwardButton(){
        const {dispatch, environment, task, project} = this.props;

        dispatch(changeActiveProjectTaskDetailsViewMode('forward-form'))
    }

    render(){
        return (
            <div className="block-content no-padding-left-right buttons">
                {this.renderTaskUserLinkStatusButtons()}
                {this.renderTaskStatusButtons()}
                {this.renderTaskForwardButton()}
            </div>
        )
    }
}

ProjectTaskDetailsButtons.propTypes = {
    task: PropTypes.object.isRequired,
    project: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
    const {environment, auth} = state;
    var user = auth.user
    var project = props.project

    return {
        environment,
        user: auth.user,
        projectUserlog: user && project.id in user.projectsuserlogs.active ? user.projectsuserlogs.active[project.id] : null,
        isProjectActive: project.isActiveForUser(user.id)
    };
}

export default connect(mapStateToProps)(ProjectTaskDetailsButtons);
