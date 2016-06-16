import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {isMobile} from 'utils/environment.es6'
import {changeLocation} from 'actions/site.es6'
import {ProjectsUrls} from 'constants/Urls.es6'
var moment = require('moment')

class ProjectTaskDetailsTime extends Component {
    render() {
        var {dispatch, project, task, user} = this.props
        var taskUserLink = task.getUser(user.id, ['task', 'info'])
        var taskStarted, taskFinished, progressTime
        
        if(user.id == task.owner_id){
            taskStarted = task.started ? moment(task.started).format('MMMM Do YYYY, HH:mm') : ''
            if(task.status == 'done'){
             taskFinished = task.finished ? moment(task.finished).format('MMMM Do YYYY, HH:mm') : ''
             progressTime = task.done_progress_time
            }
        }else if(taskUserLink && taskUserLink.type == 'task'){
            if(taskUserLink.status != 'todo'){
                taskStarted = taskUserLink.started ? moment(taskUserLink.started).format('MMMM Do YYYY, HH:mm') : ''
            }
            if(taskUserLink.status == 'done'){
                taskFinished = taskUserLink.finished ? moment(taskUserLink.finished).format('MMMM Do YYYY, HH:mm') : ''
                progressTime = taskUserLink.done_progress_time
            }
        }

        var data = []

        if(taskStarted){
            data.push(
                <div key="task-started-time" className="margin-top-bottom-5">
                    <i style={{width: '14px', height: '14px', overflow: 'hidden'}} className="fa fa-clock-o task-user-started task-label"> </i>
                    <span className="task-user-started">{taskStarted}</span>
                </div>
            )
        }
        if(taskFinished){
            data.push(
                <div key="task-finished-time" className="margin-top-bottom-5">
                    <i style={{width: '14px', height: '14px', overflow: 'hidden'}} className="fa fa-clock-o task-user-finished task-label"> </i>
                    <span className="task-user-finished">{taskFinished}</span>
                </div>
            )
        }
        if(progressTime){
            data.push(
                <div key="task-progress-time" className="margin-top-bottom-5 totalTime">
                    <strong>{gettext("Total:")}</strong>
                    <span className="totalTimeValue">{progressTime}</span>
                </div>
            )
        }

        return (
            <div className="task-time">{data}</div>
        )
    }
}

ProjectTaskDetailsTime.propTypes = {
    task: PropTypes.object.isRequired,
    project: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
    const {environment, auth} = state;
    return {
        environment,
        user: auth.user
    };
}

export default connect(mapStateToProps)(ProjectTaskDetailsTime);
