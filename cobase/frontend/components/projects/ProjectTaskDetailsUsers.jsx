import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {isMobile} from 'utils/environment.es6'
import {changeLocation} from 'actions/site.es6'
import {ProjectsUrls} from 'constants/Urls.es6'
import {PUTRequest, POSTRequest, GETRequest} from 'utils/api.es6'
import {updateActiveProjectTaskUserLink, changeActiveProjectTaskDetailsViewMode} from 'actions/projects.es6'
import messages from 'messages/projects.es6'


class ProjectTaskDetailsUsers extends Component {

    onTaskUserLinkStatusButton(userLink, status, condition=true){
        var {dispatch, project, task, user, projectUserlog, afterLinkUpdate} = this.props

        var isProjectActive = project.isActiveForUser(user.id)

        if(!condition || !isProjectActive){
            return
        }
        var skipTimer = userLink.user.id != user.id || (task.alert_type == 'global' || (userLink && userLink.type != 'task'))
        if(project.checkUserRole(user.id, 'director') || projectUserlog){
            skipTimer = true
        }
        if(!skipTimer){
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
                if(typeof afterLinkUpdate == 'function'){
                    afterLinkUpdate()
                }
            }))
        }
    }

    render() {
        var {dispatch, project, task, user} = this.props
        var users = []

        if(task.alert_type == 'global'){
            if(task.owner_id == user.id){
                for(let userLink of task.users.info){
                    users.push(
                        <div key={`info-user-${userLink.user.id}`} className={`task-user task-user-${userLink.user.id}`}>
                            <span style={{width: `70px`, display: `block`, float: 'left'}}>
                                &nbsp;
                                {userLink.status == 'todo' ? <span style={{cursor:'pointer'}} onClick={this.onTaskUserLinkStatusButton.bind(this, userLink, 'done')} className="label label-primary user-status-btn">{gettext("ToSee")}</span> : null}
                                {userLink.status == 'done' ? <span style={{cursor:'pointer'}} onClick={this.onTaskUserLinkStatusButton.bind(this, userLink, 'todo')} className="label label-success user-status-btn">{gettext("Seen")}</span> : null}
                            </span>

                            <span className="task-user-name"><i className="fa fa-user"> </i>{userLink.user.name}</span>
                            <div className="clear"></div>
                        </div>
                    )
                }
            }
        }else{
            var isClickable
            for(let userLink of task.users.task){

                isClickable = true;
                if(user.id != task.owner_id){
                    if(userLink.user_id != user.id || (userLink.status == 'pause' && (task.child && task.child.status != 'done'))){
                        isClickable = false;
                    }
                }

                users.push(
                    <div key={`task-user-${userLink.user.id}`} className={`task-user task-user-${userLink.user.id}`}>
                        <span style={{width: `70px`, display: `block`, float: 'left'}}>
                            &nbsp;
                            {userLink.status == 'progress' ? <span style={{cursor:`${isClickable ? 'pointer' : ''}`}} onClick={this.onTaskUserLinkStatusButton.bind(this, userLink, 'pause', isClickable)} className="label label-warning user-status-btn">{gettext('In Progress')}</span> : null}
                            {userLink.status == 'todo' ? <span style={{cursor:`${isClickable ? 'pointer' : ''}`}} onClick={this.onTaskUserLinkStatusButton.bind(this, userLink, 'progress', isClickable)} className="label label-primary user-status-btn">{gettext('ToDo')}</span> : null}
                            {userLink.status == 'done' ? <span style={{cursor:`${isClickable ? 'pointer' : ''}`}} onClick={this.onTaskUserLinkStatusButton.bind(this, userLink, 'todo', isClickable)} className="label label-success user-status-btn">{gettext('Done')}</span> : null}
                            {userLink.status == 'pause' ? <span style={{cursor:`${isClickable ? 'pointer' : ''}`}} onClick={this.onTaskUserLinkStatusButton.bind(this, userLink, 'done', isClickable)} className="label label-danger user-status-btn">{gettext('Pause')}</span>: null}
                        </span>
                        <span className="task-user-name">
                            <i className="fa fa-user"> </i>{userLink.user.name}&nbsp;
                            <span className="label label-info user-company-name-css">{userLink.user.company.title}</span>
                        </span>

                        <div className="clear"></div>
                    </div>
                )
            }
        }

        return (
            <div className="task-users">
                {users}
            </div>
        )
    }
}

ProjectTaskDetailsUsers.propTypes = {
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
    };
}

export default connect(mapStateToProps)(ProjectTaskDetailsUsers);
