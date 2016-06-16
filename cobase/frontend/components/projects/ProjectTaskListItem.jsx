import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {Link} from 'react-router'
import {User} from 'classes/auth.es6'
import {ProjectsUrls} from 'constants/Urls.es6'
import ProjectTimer from 'components/projects/ProjectTimer.jsx'
import {truncate} from 'utils/string.es6'
import {changeLocation} from 'actions/site.es6'
import {modal} from 'react-redux-modal'
import ProjectTaskModalContainer from 'containers/projects/ProjectTaskModalContainer.jsx'
import {changeActiveProjectTaskDetailsViewMode} from 'actions/projects.es6'
import {isMobile} from 'utils/environment.es6'


class ProjectTaskListItem extends Component {
    onTaskDetailsButton(task){
        const {dispatch} = this.props
        dispatch(changeActiveProjectTaskDetailsViewMode('view'))
        this.showTaskDetails(task)
    }
    
    onTaskMapObjectButton(task){
        const {dispatch} = this.props
        dispatch(changeActiveProjectTaskDetailsViewMode('mapobj-view'))
        this.showTaskDetails(task)
    }

    showTaskDetails(task) {
        const {dispatch, environment, user, project} = this.props;

        if (isMobile('any')) {
            changeLocation(dispatch, `${ProjectsUrls.projectTask(project.guid, task.guid)}`)
        } else {
            modal.add(ProjectTaskModalContainer, {
                title: task.type == 'alert' ? gettext('Alert') : gettext('Task'),
                size: ('large'), // large, medium or small,
                data: {
                    taskGuid: task.guid,
                    taskType: task.type,
                    project: project,
                    afterTaskSave: function(referer, updatedTask) {
                        if(referer == 'addPinButton'){
                            dispatch(changeActiveProjectTaskDetailsViewMode('mapobj-edit'))
                            modal.add(ProjectTaskModalContainer, {
                                title: updatedTask.type == 'alert' ? gettext('Alert') : gettext('Task'),
                                size: ('large'),
                                data:{
                                    taskGuid: updatedTask.guid,
                                    project: project,
                                },
                                closeOnOutsideClick: false
                            });
                        }
                    }
                },
                closeOnOutsideClick: false
            });
        }
    }

    render() {
        const {dispatch, user, project, task, status, usersString, unread, newtask} = this.props;

        return (
            <div className={`col-xs-12 col-sm-6 col-md-6 col-lg-6 project-task project-task-${task.id} project-task-${task.guid} tasklist ${unread ? 'unread' : ''} ${newtask ? 'newtask' : ''}`}>
                <div className="task-content pointer">
                    <div style={{paddingBottom: '5px'}} onClick={this.onTaskDetailsButton.bind(this, task)}>
                    <h2 className="task-title small-task-title">
                        {task.has_child || (task.is_subtask && task.owner_id == user.id) ? <i className="fa fa-arrow-circle-right forward-label-icon-css" title="Forward"> </i> : null}
                        {task.type == "alert" ? <i className="fa fa-bell text-danger" title={gettext("Alert")}> </i> : null}
                        {status == "progress" ? <span className="label label-warning">{gettext("In progress")}</span> : null}
                        {status == "todo" ? <span className="label label-primary">{gettext("ToDo")}</span> : null}
                        {status == "pause" ? <span className="label label-danger">{gettext("Pause")}</span> : null}
                        {status == "done" ? <span className="label label-success">{gettext("Done")}</span> : null}
                        &nbsp;
                        {truncate(task.title, 20, 50)}
                    </h2>
                    <div className="col-xs-10 col-sm-10 col-md-10 col-lg-10 no-padding">
                        <div className="cut-task-description small-description">{truncate(task.description, 40, 100)}</div>
                    </div>
                    <div className="col-xs-2 col-sm-2 col-md-2 col-lg-2 pull-right text-right no-padding">
                        <i className="fa fa-ellipsis-v project-task-open-button pointer"> </i>
                    </div>

                    <div className="clear"></div>
                    </div>

                    <div className="col-xs-5 col-sm-3 col-md-3 col-lg-3 no-padding">
                        <div className="task-icons">
                            {task.image_id && task.hasCoords() ? <a onClick={this.onTaskMapObjectButton.bind(this, task)}  className="item item-circle bg-default-light text-white-op select-task-mapobj-btn" href="javascript://"> <i className="fa fa-map-marker"> </i></a> : null}
                            {task.speciality == "extra" ? <a className="item item-circle bg-danger text-white-op" href="javascript://" style={{lineHeight:'32px'}}> <i className="glyphicon glyphicon-asterisk"> </i> </a> : null}
                        </div>
                    </div>
                    <div onClick={this.onTaskDetailsButton.bind(this, task)} className="col-xs-7 col-sm-9 col-md-9 col-lg-9 no-padding" style={{height: '35px'}}>
                        <div className="task-members text-right"><span className="task-members-string">{usersString}</span></div>
                    </div>
                    <div className="clear"></div>
                </div>
                <div className="clear"></div>
            </div>
        )
    }
}

ProjectTaskListItem.propTypes = {
    project: PropTypes.object.isRequired,
    status: PropTypes.string.isRequired,
    usersString: PropTypes.string.isRequired,
    position: PropTypes.string,
    unread: PropTypes.bool,
    newtask: PropTypes.bool,
}

function mapStateToProps(state, props) {
    const {environment, auth} = state;
    return {
        environment,
        user: auth.user
    }
}

export default connect(mapStateToProps)(ProjectTaskListItem);
