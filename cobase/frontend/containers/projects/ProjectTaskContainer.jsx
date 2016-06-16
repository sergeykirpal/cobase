import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {fetchActiveProjectTaskDetailsIfNeed, changeActiveProjectTaskDetailsViewMode, updateActiveProjectTaskUserLink, selectActiveProjectImageTask} from 'actions/projects.es6'
import {fetchUserIfNeed} from 'actions/auth.es6'
import ProjectTaskDetails from 'components/projects/ProjectTaskDetails.jsx'
import ProjectTaskForm from 'components/projects/ProjectTaskForm.jsx'
import ProjectTaskMapObject from 'components/projects/ProjectTaskMapObject.jsx'
import ProjectTaskForwardForm from 'components/projects/ProjectTaskForwardForm.jsx'
import ProjectTimer from 'components/projects/ProjectTimer.jsx'
import Loading from 'components/Loading.jsx'
import {changeLocation} from 'actions/site.es6'
import {ProjectsUrls} from 'constants/Urls.es6'
import {ProjectTask} from 'classes/projects/common.es6'
import {isMobile} from 'utils/environment.es6'


export default class ProjectTaskContainer extends Component {
    afterProjectTimerStart(){
        const {dispatch} = this.props;
        dispatch(changeActiveProjectTaskDetailsViewMode('view'))
    }

    afterMapObjectUpdate(){
        const {dispatch, task} = this.props;
        dispatch(fetchActiveProjectTaskDetailsIfNeed(task.guid, true))
        dispatch(changeActiveProjectTaskDetailsViewMode('view'))
    }

    onOpenDrawingButton(imageGuid){
        var {dispatch, project, task} = this.props
        var taskGuid = !task.is_subtask ? task.guid : task.parent.guid
        dispatch(changeActiveProjectTaskDetailsViewMode('mapobj-view'))
        //dispatch(selectActiveProjectImageTask(taskGuid))
        //changeLocation(dispatch, ProjectsUrls.projectDrawing(project.guid, imageGuid))
    }

    renderContent() {
        const {dispatch, user, height, project, task, viewMode, taskType, taskGuid} = this.props;
        if ((!task && taskGuid) || !user.id || !project) {
            return <Loading />
        }

        var projectActive = project.isActiveForUser(user.id)
        var isTaskEditable, isForwarded, childTask
        var content = null
        if(task){
            isTaskEditable = projectActive && task.isEditableForUser(user.id)
            isForwarded = projectActive && task.isForwarded(user.id)
            childTask = task.child ? new ProjectTask(task.child) : null
        }

        if(task && viewMode == 'view'){
            return <ProjectTaskDetails task={task} project={project} onOpenDrawingButton={this.onOpenDrawingButton.bind(this)}/>
        }
        if(viewMode == 'form' && (task && isTaskEditable) || !task){
            return <ProjectTaskForm afterSave={this.afterTaskSave.bind(this)} taskType={taskType}  task={task} project={project} onCancelButton={this.onCancelButton.bind(this)} afterTaskDelete={this.afterTaskDelete.bind(this)}/>
        }
        if(task && viewMode == 'forward-form'){
            return <ProjectTaskForwardForm parent={task} task={childTask} project={project} />
        }
        if(task && viewMode == 'mapobj-view'){
            return <ProjectTaskMapObject mode="view" task={task} project={project} image={task ? task.image : null} height={height} cancelButton={!isMobile('any')}/>
        }
        if(task && viewMode == 'mapobj-edit' && isTaskEditable){
            return <ProjectTaskMapObject mode="edit" task={task} project={project} image={task ? task.image : null} height={height} afterUpdate={this.afterMapObjectUpdate.bind(this)} cancelButton={!isMobile('any')} />
        }
        if(task && viewMode == 'timer'){
            return (
                <div style={{textAlign: 'center'}}>
                    <h3>{gettext('You have to start timer first...')}</h3>
                    <ProjectTimer project={project} single={true} afterStart={this.afterProjectTimerStart.bind(this)}/>
                </div>
            )
        }
    }
}