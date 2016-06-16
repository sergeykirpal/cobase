import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {fetchActiveProjectTaskDetailsIfNeed, initActiveProject, getActiveProject, changeActiveProjectTaskDetailsViewMode} from 'actions/projects.es6'
import {fetchUserIfNeed} from 'actions/auth.es6'
import * as config from 'constants/Config.es6';
import Loading from 'components/Loading.jsx'
import {changeTitle, toggleBackButton} from 'actions/site.es6'
import {isMobile} from 'utils/environment.es6'
import ProjectTaskContainer from 'containers/projects/ProjectTaskContainer.jsx'
import {changeLocation} from 'actions/site.es6'
import {ProjectsUrls} from 'constants/Urls.es6'


class ProjectTaskPageContainer extends ProjectTaskContainer {
    afterTaskDelete(){
        appHistory.goBack()
    }

    afterTaskSave(referer, updatedTask){
        const {dispatch, project} = this.props;

        appHistory.goBack()

        if(referer == 'addPinButton'){
            dispatch(changeActiveProjectTaskDetailsViewMode('mapobj-edit'))
            setTimeout(function () {
                changeLocation(dispatch, `${ProjectsUrls.projectTask(project.guid, updatedTask.guid)}`)
            }, 1000)
        }
    }

    onCancelButton(){
        const {dispatch, user, pageContentHeight, project, task, viewMode} = this.props;
        if(task){
            dispatch(changeActiveProjectTaskDetailsViewMode('view'))
        }else{
            appHistory.goBack()
        }
    }

    onOpenDrawingButton(imageGuid){
        var {dispatch, project, task} = this.props
        var taskGuid = !task.is_subtask ? task.guid : task.parent.guid
        dispatch(changeActiveProjectTaskDetailsViewMode('mapobj-view'))
        //dispatch(selectActiveProjectImageTask(taskGuid))
        //changeLocation(dispatch, ProjectsUrls.projectDrawing(project.guid, imageGuid))
    }

    componentDidMount() {
        const {dispatch, user, projects, activeProjectGuid, taskType, taskGuid, viewMode} = this.props;
        dispatch(initActiveProject(activeProjectGuid, function (project) {
            dispatch(changeTitle(taskGuid ? project.title : taskType == 'alert' ? gettext('New Alert') : gettext('New Task')))
            if(taskGuid){
                dispatch(fetchActiveProjectTaskDetailsIfNeed(taskGuid))
            }
        }))
        dispatch(toggleBackButton(true))
        dispatch(fetchUserIfNeed(config.AUTH_USER_BASE_FIELDS))

        if(viewMode == 'timer'){
            dispatch(changeActiveProjectTaskDetailsViewMode('view'))
        }
    }

    render(){
        const {dispatch, user, height, project, task, viewMode} = this.props;

        return <div className={`pagecontent pagecontent-white setScrollBar`} style={{paddingBottom: '10px', height: `${height}px`}}>
            {this.renderContent()}
            <div className="clear"></div>
        </div>
    }
}

function mapStateToProps(state, props) {
    const {environment, auth, projects} = state;
    var taskDetails = projects.activeProject ? projects.activeProject.taskDetails : null
    var task = taskDetails ? taskDetails.task : null
    var taskType = task ? task.type : props.params['taskType']
    return {
        environment,
        auth,
        user: auth.user,
        projects,
        activeProjectGuid: props.params['guid'],
        taskGuid: props.params['taskGuid'],
        height: environment.pageContentHeight,
        task: task,
        taskType,
        viewMode: taskDetails ? taskDetails.viewMode : 'view',
        project: getActiveProject(projects)
    };
}

export default connect(mapStateToProps)(ProjectTaskPageContainer);
