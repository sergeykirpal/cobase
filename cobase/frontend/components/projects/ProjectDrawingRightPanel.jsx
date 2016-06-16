import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {Link} from 'react-router'
import {getAnyActiveProjectImage, getActiveProject, toggleProjectDrawingRightPanel, changeProjectDrawingActiveTab, changeActiveProjectTaskDetailsViewMode} from 'actions/projects.es6'
import {changeLocation} from 'actions/site.es6'
import {ProjectsUrls} from 'constants/Urls.es6'
import {isMobile} from 'utils/environment.es6'
import Loading from 'components/Loading.jsx'
import ProjectFolders from 'components/projects/ProjectFolders.jsx'
import ProjectDrawingAllTasks from 'components/projects/ProjectDrawingAllTasks.jsx'
import ProjectDrawingTasks from 'components/projects/ProjectDrawingTasks.jsx'
import {modal} from 'react-redux-modal'
import ProjectTaskModalContainer from 'containers/projects/ProjectTaskModalContainer.jsx'


class ProjectDrawingRightPanel extends Component {
    componentWillUnmount(){
        const {dispatch, user} = this.props;
    }

    componentDidMount(){
        const {dispatch, user, projects} = this.props;
        var tab = projects.activeProject.drawingActiveTab
        dispatch(changeProjectDrawingActiveTab(tab, true))
        this.bindButtons()
    }

    bindButtons(){
        const {dispatch, user, project, tasks} = this.props;
        var $box = $('#right-side-overlay')
        var self = this

        $box.on('click', '.task-mapobj-btn', function(){
            var $btn = $(this)
            var $task = $btn.closest('.project-task')
            var taskGuid = $task.data('taskguid')
            var taskImageGuid = $task.data('taskimageguid')
            var imageGuid = $task.data('imageguid')

            dmangr.selectMapObject(taskGuid, true)
            if(imageGuid != taskImageGuid){
                changeLocation(dispatch, `${ProjectsUrls.projectDrawing(project.guid, taskImageGuid)}`)
            }
        })
        $box.on('click', '.task-details-btn', function(){
            var $btn = $(this)
            var $task = $btn.closest('.project-task')
            var taskGuid = $task.data('taskguid')
            self.showTaskDetails(taskGuid)
        })
    }

    showTaskDetails(taskGuid){
        const {dispatch, user, project, tasks} = this.props;
        dispatch(changeActiveProjectTaskDetailsViewMode('view'))
        if(isMobile('any')){
            changeLocation(dispatch, `${ProjectsUrls.projectTask(project.guid, taskGuid)}`)
        }else{
            this.showTaskDetailsInModal(taskGuid)
        }
    }

    showTaskDetailsInModal(taskGuid){
        const {dispatch, environment, user, projects, project} = this.props;
        var task = projects.activeProject.tasks[taskGuid]

        modal.add(ProjectTaskModalContainer, {
            title: task.type == 'alert' ? gettext('Alert') : gettext('Task'),
            size: ('large'), // large, medium or small,
            data:{
                taskGuid: taskGuid,
                project: project,
            },
            closeOnOutsideClick: false
        });
    }

    onTabButton(tab){
        const {dispatch, user, projects} = this.props;
        dispatch(changeProjectDrawingActiveTab(tab))
    }

    tabBoxHeight(){
        const {dispatch, environment, user, projects} = this.props;
        return environment.height - 22
    }

    onProjectFileClick(file){
        const {dispatch, environment, user, project} = this.props;
        changeLocation(dispatch, ProjectsUrls.projectDrawing(project.guid, file.guid))
    }

    renderAllTasksTabBox(){
        const {dispatch, environment, user, projects, project, image} = this.props;

        var height = this.tabBoxHeight()
        var tasksSetName = `allImagesTasks`
        var tasksSet = projects.activeProject.tasksSets[tasksSetName]
        var isFetching = tasksSet ? tasksSet.isFetching : false
        var selectedTask = projects.activeProject.activeImageTask
        var tasksSetItems = tasksSet && tasksSet.items ? tasksSet.items : []
        var tasks = projects.activeProject.tasks

        var items = []
        if(image){
            for(let taskGuid of tasksSetItems){
                var task = tasks[taskGuid]
                if(task){
                    items.push(task)
                }
            }
        }

        return <ProjectDrawingAllTasks height={height} image={image} project={project} items={items} isFetching={isFetching} selectedTask={selectedTask} />
    }

    renderDrawingTasksTabBox(){
        const {dispatch, environment, user, projects, project, image} = this.props;

        var height = this.tabBoxHeight()
        var tasks = projects.activeProject.tasks
        var items = []
        var selectedTask = null
        if(image){
            var imageId = image.id
            var tasksSetName = `image${imageId}Tasks`
            var tasksSet = projects.activeProject.tasksSets[tasksSetName]
            selectedTask = projects.activeProject.activeImageTask
            var tasksSetItems = tasksSet && tasksSet.items ? tasksSet.items : []

            for(let taskGuid of tasksSetItems){
                var task = tasks[taskGuid]
                if(task){
                    items.push(task)
                }
            }
        }


        return <ProjectDrawingTasks height={height} image={image} project={project} items={items} selectedTask={selectedTask} />
    }

    renderProjectUploadDrawingsButton(){
        const {dispatch, environment, user, project} = this.props;

        if(!project || !user){
            return
        }

        var isProjectActive = project.isActiveForUser(user.id)
        var projectUserRole = project.getUserRole(user.id)
        if(isProjectActive && (projectUserRole == 'manager' || projectUserRole == 'director')){
            return <span className="drawing-manager-css pointer pull-right" onClick={changeLocation.bind(this, dispatch, ProjectsUrls.project(project.guid, 'upload'))}><i className="si si-map"> </i> <div>{gettext("MANAGER")}</div> </span>
        }
    }

    renderProjectUploadDrawingsArea(){
        const {dispatch, environment, user, project} = this.props;

        if(!project || !user){
            return
        }

        var isProjectActive = project.isActiveForUser(user.id)
        var projectUserRole = project.getUserRole(user.id)
        if(isProjectActive && (projectUserRole == 'manager' || projectUserRole == 'director')){
            return(
               <div style={{marginTop: '5%'}} className="pointer upload-drawing-cloud" onClick={changeLocation.bind(this, dispatch, ProjectsUrls.project(project.guid, 'upload'))} >
                    <center>
                        <span  style={{fontSize: '50px'}} className="fa fa-cloud-upload text-dark-gray"> </span>
                    </center>
                    <h6 className="text-center"> {gettext("UPLOAD DRAWINGS")} </h6>
               </div>
            )
        }
    }

    renderDrawingsTabBox(){
        const {dispatch, environment, user, projects, project, image} = this.props;

        var folders = projects.activeProject.folders
        var anyImage = getAnyActiveProjectImage(projects)
        var projectUserRole = project.getUserRole(user.id)
        var height = this.tabBoxHeight()

        return (
            <div className="tab-pane setScrollBar fadeIn right-side-tabbox drawings-tabbox" style={{height: `${height}px`}}>
                <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                    <table className="js-table-sections table table-hover">
                        <thead>
                            <tr>
                                <th style={{width: '30px'}}> </th>
                                <th><div className="pull-left" style={{margin: '7px 0 0 0'}}>{gettext("FOLDERS")}</div>
                                    {this.renderProjectUploadDrawingsButton()}
                                </th>
                            </tr>
                            <tr className={!anyImage ? '' : 'hide'} >
                                <td colSpan="2">
                                    <div>
                                        <div className="alert alert-warning alert-dismissable">
                                            <div className="message emptyPage message-for-empty-drawing-map" data="1">
                                                {gettext("You haven't upload any drawings yet")}
                                            </div>
                                        </div>
                                        {this.renderProjectUploadDrawingsArea()}
                                    </div>
                                </td>
                            </tr>
                        </thead>
                    </table>
                    <ProjectFolders folders={folders} project={project} activeFile={image} onFileClick={this.onProjectFileClick.bind(this)}/>
                </div>
            </div>
        )
    }

    render() {
        const {dispatch, environment, user, projects, project, image} = this.props;
        var height = this.tabBoxHeight()

        return (
            <aside id="right-side-overlay" >
                <div id="right-side-overlay-scroll">                                
                    <div className="block">
                        <button className="btn btn-default hideRightSide" type="button" onClick={toggleProjectDrawingRightPanel.bind(this, dispatch, false)}><i title={gettext("Close")} className="fa fa-times"> </i></button>
                        <ul className="nav nav-tabs nav-tabs-alt">
                            <li><a className="tab drawings-tab pointer" onClick={this.onTabButton.bind(this, 'drawings-tab')}>{gettext("DRAWINGS")}</a></li>
                            <li><a className="tab drawing-tasks-tab pointer" onClick={this.onTabButton.bind(this, 'drawing-tasks-tab')}>{gettext("TASKS")}</a></li>
                            <li><a className="tab all-tasks-tab pointer" onClick={this.onTabButton.bind(this, 'all-tasks-tab')}>{gettext("ALL TASKS")}</a></li>
                        </ul>

                        <div className="block-content tab-content">
                            {this.renderDrawingTasksTabBox()}
                            {this.renderAllTasksTabBox()}
                            {this.renderDrawingsTabBox()}
                        </div>
                        <div className="clear"></div>
                    </div>            
                </div>
            </aside>
        );
    }
}

function mapStateToProps(state, props) {
    const {environment, auth, projects} = state;
    return {
        environment,
        user: auth.user,
        projects,
    };
}

export default connect(mapStateToProps)(ProjectDrawingRightPanel);
