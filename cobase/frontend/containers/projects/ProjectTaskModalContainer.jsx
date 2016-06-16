import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {changeActiveProjectTaskDetailsViewMode, fetchActiveProjectTaskDetailsIfNeed, initActiveProject, getActiveProject} from 'actions/projects.es6'
import {fetchUserIfNeed} from 'actions/auth.es6'
import * as config from 'constants/Config.es6';
import ProjectTaskContainer from 'containers/projects/ProjectTaskContainer.jsx'
import {isMobile} from 'utils/environment.es6'
import {modal} from 'react-redux-modal'


class ProjectTaskModalContainer extends ProjectTaskContainer {
    afterTaskDelete(){
        this.props.remove()
    }

    afterTaskSave(referer, updatedTask){
        const {dispatch, project, afterTaskSave} = this.props;
        this.props.remove()

        if(typeof afterTaskSave == 'function'){
            afterTaskSave(referer, updatedTask)
        }
    }

    onCancelButton(){
        const {dispatch, user, pageContentHeight, project, task, viewMode} = this.props;
        if(task){
            dispatch(changeActiveProjectTaskDetailsViewMode('view'))
        }else{
            this.props.remove()
        }
    }

    componentDidMount() {
        const {dispatch, user, projects, activeProjectGuid, taskGuid} = this.props;
        if(taskGuid){
            dispatch(fetchActiveProjectTaskDetailsIfNeed(taskGuid))
        }
    }

    render(){
        const {dispatch, user, pageContentHeight, project, task, viewMode, height} = this.props;
        return <div className={`pagecontent pagecontent-white`} style={{paddingBottom: '10px', minHeight: `${height}px`}}>
            {this.renderContent()}
            <div className="clear"></div>
        </div>
    }
}

ProjectTaskModalContainer.propTypes = {
    data: PropTypes.object.isRequired,
}

function mapStateToProps(state, props) {
    const {environment, auth, projects} = state;
    var taskDetails = projects.activeProject ? projects.activeProject.taskDetails : null
    var task = taskDetails.task
    var taskType = task ? task.type : props.data.taskType

    return {
        environment,
        user: auth.user,
        taskGuid: props.data.taskGuid,
        afterTaskSave: props.data.afterTaskSave,
        project: props.data.project,
        viewMode: taskDetails ? taskDetails.viewMode : 'view',
        task: task,
        taskType,
        pageContentHeight: environment.pageContentHeight,
        height: environment.pageContentHeight - 250
    };
}

export default connect(mapStateToProps)(ProjectTaskModalContainer);
