import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import ProjectTaskFormUser from 'components/projects/ProjectTaskFormUser.jsx'
import {activeProjectTaskDetailsUpdated, resetActiveProjectTaskDetails, updateActiveProjectTask, deleteActiveProjectTask, changeActiveProjectTaskDetailsViewMode, createActiveProjectTask} from 'actions/projects.es6'
import ProjectTaskFormUsers from 'components/projects/ProjectTaskFormUsers.jsx'
import ProjectTaskFormImages from 'components/projects/ProjectTaskFormImages.jsx'
import ProjectFolders from 'components/projects/ProjectFolders.jsx'

class ProjectTaskForm extends Component {
    componentDidMount(){
        this.bindButtons()
    }

    bindButtons(){
        const {dispatch, user} = this.props;

        var $form = $('.project-task-form-box')
        $form.find('.change-task-type-btn').click(function(){
            var $btn = $(this)
            var isAlert = $btn.val() == 'alert'

            $form.find('.change-alert-type-btn').closest('.checkbox').toggleClass('hide', !isAlert)
            $form.find('.change-alert-type-btn').prop('checked', false)
            $form.find('.alert-type').val(isAlert ? 'default' : 'none')
            $form.find('.project-users').toggleClass('hide', false)

            var $currentUser = $form.find('.project-users').find(`.project-user-${user.id}`)
            $currentUser.toggleClass('hide', isAlert);
        })

        $form.find('.change-alert-type-btn').click(function(){
            var $btn = $(this)
            var isGlobalAlert = $btn.prop('checked')
            $form.find('.alert-type').val(isGlobalAlert ? 'global' : 'default')
            $form.find('.project-users').toggleClass('hide', isGlobalAlert)
        })
    }

    onAddNewPinButton(){
        const {dispatch, user, defaultTaskName, task, project, afterSave} = this.props;
        $('.project-files').toggleClass('hide')
    }

    onSaveTaskButton(referer){
        const {dispatch, user, defaultTaskName, task, project, afterSave} = this.props;
        var callback = afterSave ? afterSave : this.onCancelButton
        var $form = $('.project-task-form-box')
        var $title = $form.find('input.title')
        if(!$title.val().length){
            $title.val(defaultTaskName)
        }

        var params = $form.find('form').serialize()
        if(task){
            dispatch(updateActiveProjectTask(task, params, (updatedTask) => {
                activeProjectTaskDetailsUpdated(updatedTask)
                callback(referer, updatedTask)
            }))
        }else{
            dispatch(createActiveProjectTask(project.id, params, (updatedTask) => {
                activeProjectTaskDetailsUpdated(updatedTask)
                callback(referer, updatedTask)
            }))
        }
    }

    onEditTaskMapObjectButton(){
        const {dispatch, user, defaultTaskName, task} = this.props;
        dispatch(changeActiveProjectTaskDetailsViewMode('mapobj-edit'))
    }

    onProjectFileClick(file){
        const {dispatch, user, defaultTaskName, task} = this.props;
        var $form = $('.task-form-data-box')
        var lan = -1 * (Math.floor(Math.random() * 70) + 50)
        var ltg = Math.floor(Math.random() * 70) + 50
        $form.find('.project-task-view-type').attr('name', 'view_type').val('marker')
        $form.find('.project-task-image').attr('name', 'image').val(file.id)
        $form.find('.project-task-coordinates').attr('name', 'coordinates').val(JSON.stringify({type:'point', value:[lan, ltg]}))

        this.onSaveTaskButton('addPinButton')
    }

    onDeleteTaskButton(){
        const {dispatch, user, task, afterTaskDelete} = this.props;

        swal({
            title: gettext("Are you sure?"),
            text: gettext("You will not be able to recover this task!"),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: gettext("Yes, delete it!"),
            cancelButtonText: gettext("No, cancel!"),
            closeOnConfirm: true,
            closeOnCancel: true
        }, function(isConfirm){
            if (isConfirm) {
                dispatch(deleteActiveProjectTask(task, afterTaskDelete))
            } else {
                swal(gettext("Cancelled"), gettext("Your task is safe :)"), "error")
            }
        })
    }

    render() {
        const {dispatch, environment, task, project, user, defaultTaskName, taskType, taskImages, projectFolders, onCancelButton} = this.props;
        var projectUserRole = project.getUserRole(user.id)
        var taskTitle = task && task.title && task.title != defaultTaskName && task.title.length ? task.title : ''
        var taskAlertType = 'none'
        if(task && task.alert_type){
            taskAlertType = task.alert_type
        }else if(taskType == 'alert'){
            taskAlertType = 'default'
        }

        return (
            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 project-task-form-box">
                <div className="progress progress-top fixed hidden-sm hidden-md hidden-lg hide">
                    <div className="progress-bar progress-bar-danger" role="progressbar" aria-valuemin="0" aria-valuemax="100"><span className="persent">0%</span></div>
                </div>
                <form className="task-form-data-box" method="post">
                    <div>
                        <div className="messages"></div><br/>
                        <input className="project-task-view-type" type="hidden"/>
                        <input className="project-task-coordinates" type="hidden"/>
                        <input className="project-task-image" type="hidden"/>
                        {(()=>{
                            if(!task || !task.is_subtask){
                                return(
                                   <div className="form-group">
                                        <div className="task-type">
                                            <label className="css-input css-radio css-radio-primary push-10-r">
                                                <input className="change-task-type-btn" type="radio" name="target" value="task" defaultChecked={taskType != 'alert'} />
                                                <span> </span> <span className="label label-primary label-lg labelstyle labelstylewidth">{gettext("TASK")}</span>
                                            </label>
                                            <br/>
                                            <label className="css-input css-radio css-radio-danger push-10-r">
                                                <input className="change-task-type-btn" type="radio" name="target" value="alert" defaultChecked={taskType == 'alert'} />
                                                <span> </span> <span className="label label-danger label-lg labelstyle labelstylewidth">{gettext("ALERT")}</span>
                                            </label>
                                        </div>
                                    </div>
                                )
                            }
                        })()}

                        <div className="form-group">
                            <label>{gettext("Title")}</label>
                            <input className="form-control title" defaultValue={taskTitle} name="title" type="text" placeholder={defaultTaskName} />
                        </div>
                        
                        <div className="contentform">

                            <div className="form-group">
                                <label>{gettext("Description")}</label>
                                <textarea className="form-control description" placeholder={gettext("Description")} name="description" defaultValue={task ? task.description : ''} />
                            </div>
                            {(()=>{
                                if(!task || !task.is_subtask){
                                    return(
                                       <div className="form-group task-user-owner-box">
                                           {(()=>{
                                               if(projectUserRole == 'manager' || projectUserRole == 'director'){
                                                   return(
                                                        <div>
                                                            <div className="checkbox task-btn extra-work-task-btn-box">
                                                                <label style={{paddingLeft: '0'}} className="css-input css-checkbox css-checkbox-primary">
                                                                    <input className="extra-work-task-btn" type="checkbox" value="extra" defaultChecked={task && task.speciality == 'extra'} name="speciality" />
                                                                    <span> </span> {gettext("Extra Work")}
                                                                </label>
                                                                <div className="text-muted" style={{fontSize: '11px', margin: '0 0 0 25px'}} >{gettext("Extra task will be added in separate category into diary")}</div>
                                                            </div>

                                                            <div className={`checkbox ${taskType == "alert" ? '' : 'hide'}`}>
                                                                <label style={{paddingLeft: '0'}} className="css-input css-checkbox css-checkbox-primary">
                                                                    <input className="change-alert-type-btn" type="checkbox" defaultChecked={task && task.alert_type == 'global'} />
                                                                    <span> </span> {gettext("Global Alert")}
                                                                </label>
                                                            </div>
                                                        </div>
                                                   )
                                               }
                                           })()}

                                            <input className="alert-type" type="hidden" value={taskAlertType} name="alert_type" />
                                            <input  type="hidden" value="1234" name="jssid" />
                                        </div>
                                    )
                                }
                            })()}


                            <div className="form-group">
                                <h3 className="block-title">{gettext("ASSIGN TO")}</h3>
                            </div>

                            <div className="form-group">
                                <ProjectTaskFormUsers task={task} project={project} renderOwner={taskType != 'alert'} ownerId={task ? task.owner_id : null} />
                                <div className="clear"></div>
                            </div>

                            <ProjectTaskFormImages task={task} images={taskImages} project={project} />
                            {task && task.coordinates.length ? <span> <button onClick={this.onEditTaskMapObjectButton.bind(this)} type="button" className="btn btn-default edit-task-map-object-btn"><i className="fa fa-map-marker"> </i> {gettext("Edit Pin Location")}</button> <br/><br/> </span> : null}
                            {(()=>{
                                if((task && !task.coordinates.length) || !task){
                                    return(
                                       <div>
                                            <div className="form-group">
                                                <div>
                                                    <div className="markerStyle" style={{float: 'left'}}></div>
                                                    <button onClick={this.onAddNewPinButton.bind(this)} type="button" className="btn btn-default show-project-folders-btn" style={{marginTop: '4px'}}>
                                                        {gettext("+ Add New Pin")}
                                                    </button>
                                                </div>
                                                <div className="project-files hide">
                                                    <div className="title"> {gettext("Select drawing folder")} </div>
                                                    <ProjectFolders folders={projectFolders} project={project} onFileClick={this.onProjectFileClick.bind(this)}/>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            })()}
                            <div className="clear"></div>
                        </div>
                    </div>
                    
                    <div className="modal-footer" style={{textAlign: 'left', paddingLeft: '0'}}>
                        <button className="btn btn-sm btn-primary save-task-btn" type="button" onClick={this.onSaveTaskButton.bind(this, 'saveButton')}>
                            <i className="fa fa-check"> </i> {task ? gettext("Update") : gettext("Add")}
                        </button>
                        {task ? <button className="btn btn-sm btn-danger remove-task-btn" type="button" onClick={this.onDeleteTaskButton.bind(this)}> <i className="fa fa-minus-circle"> </i> {gettext("Delete")} </button> :null}
                        <button className="btn btn-sm btn-default cancel-save-task-button" type="button" onClick={onCancelButton.bind(this)}>
                            {gettext("Cancel")}
                        </button>
                    </div>
                </form>
            </div>
        );
    }
}

ProjectTaskForm.propTypes = {
    project: PropTypes.object.isRequired,
    afterTaskDelete: PropTypes.func,
    onCancelButton: PropTypes.func,
    taskType: PropTypes.string.isRequired,
}

function mapStateToProps(state, props) {
    const {environment, auth, projects} = state;
    return {
        environment,
        user: auth.user,
        taskImages: props.task ? props.task.files.images : projects.activeProject.taskDetails.images,
        defaultTaskName: props.taskType == 'task' ? gettext('New Task') : gettext('New Alert'),
        projectFolders: projects.activeProject.folders
    };
}

export default connect(mapStateToProps)(ProjectTaskForm);
