import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import ProjectTaskFormUser from 'components/projects/ProjectTaskFormUser.jsx'
import {forwardActiveProjectTask, changeActiveProjectTaskDetailsViewMode, deleteActiveProjectTask, fetchActiveProjectTaskDetailsIfNeed} from 'actions/projects.es6'
import ProjectTaskFormUsers from 'components/projects/ProjectTaskFormUsers.jsx'
import ProjectTaskFormImages from 'components/projects/ProjectTaskFormImages.jsx'


class ProjectTaskForwardForm extends Component {
    renderImages(){
        return (
            <div className="form-group">
                <div className="progress progress-top no-position hidden-xs hide">
                    <div className="progress-bar progress-bar-danger" role="progressbar" aria-valuemin="0" aria-valuemax="100"><span className="persent">0%</span></div>
                </div>

                <span className="btn fileinput-button" style={{marginTop: '4px'}}> <i className="glyphicon glyphicon-plus"> </i> <span>{gettext("Add photo")}</span>
                    <input className="fileupload" type="file" name="files" />
                </span>
                <div className="clear"></div>
                <div className="project-task-addedit-images my-gallery" itemScope="" itemType="http://schema.org/ImageGallery"></div>
                <div className="clear"></div>
            </div>
        )
    }

    onForwardTaskButton(){
        return this.onUpdateTaskButton()
    }

    onUpdateTaskButton(){
        const {dispatch, user, defaultTaskName, parent} = this.props;

        var $form = $('.project-task-forward-form-box')
        var $title = $form.find('input.title')
        if(!$title.val().length){
            $title.val(defaultTaskName)
        }

        var params = $form.find('form').serialize()
        dispatch(forwardActiveProjectTask(parent, params, (updatedTask) => {
            this.onCancelButton()
        }))
    }

    onEditTaskMapObjectButton(){
        const {dispatch, user, defaultTaskName, task, parent} = this.props;
        dispatch(changeActiveProjectTaskDetailsViewMode('mapobj-edit'))
    }

    onDeleteTaskButton(){
        const {dispatch, user, task, parent} = this.props;
        var self = this

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
                dispatch(deleteActiveProjectTask(task, function(){
                    dispatch(fetchActiveProjectTaskDetailsIfNeed(parent.guid, true))
                    self.onCancelButton()
                }))
            } else {
                swal(gettext("Cancelled"), gettext("Your task is safe :)"), "error")
            }
        })
    }

    onCancelButton(){
        const {dispatch, user, defaultTaskName, task} = this.props;
        dispatch(changeActiveProjectTaskDetailsViewMode('view'))
    }

    render() {
        const {dispatch, environment, parent, task, project, user, defaultTaskName} = this.props

        var taskTitle
        var taskDescription = task ? task.description : parent.description
        if(task){
            taskTitle = task.title != defaultTaskName && task.title.length ? task.title : ''
        }else{
            taskTitle = parent.title != defaultTaskName && parent.title.length ? parent.title : ''
        }

        return (
            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 project-task-forward-form-box">
                <h3>{gettext("Task Forward")}</h3>
                <form className="task-form-data-box" method="post">
                    <div>
                        <div className="messages"></div><br/>

                        <div className="form-group">
                            <label>{gettext("Title")}</label>
                            <input className="form-control title" defaultValue={taskTitle} name="title" type="text" placeholder={defaultTaskName} />
                        </div>

                        <div className="contentform">

                            <div className="form-group">
                                <label>{gettext("Description")}</label>
                                <textarea className="form-control description" placeholder={gettext("Description")} name="description" defaultValue={taskDescription} />
                            </div>

                            <div className="form-group">
                                <h3 className="block-title">{gettext("ASSIGN TO")}</h3>
                            </div>

                            <div className="form-group">
                                <ProjectTaskFormUsers task={task} project={project} renderOwner={false} ownerId={parent.owner_id} />
                                <div className="clear"></div>
                            </div>
                            <ProjectTaskFormImages task={parent} images={parent.files.images} project={project} />
                            {task && task.coordinates ? <span> <button onClick={this.onEditTaskMapObjectButton.bind(this)} type="button" className="btn btn-default edit-task-map-object-btn"><i className="fa fa-map-marker"> </i> {gettext("Edit Pin Location")}</button> <br/><br/> </span> : null}
                            <div className="clear"></div>
                        </div>
                    </div>

                    <div className="modal-footer" style={{textAlign: 'left', paddingLeft: '0'}}>
                        {(()=>{
                            if(!task){
                                return(
                                   <button className="btn btn-sm btn-primary" type="button" onClick={this.onForwardTaskButton.bind(this)}>
                                        <i className="fa fa-check"> </i> {gettext("Forward")}
                                    </button>
                                )
                            }else{
                                return (
                                    <span>
                                        <button className="btn btn-sm btn-primary" type="button" onClick={this.onUpdateTaskButton.bind(this)}>
                                            <i className="fa fa-check"> </i> {gettext("Update")}
                                        </button>
                                        &nbsp;
                                        <button className="btn btn-sm btn-danger" type="button" onClick={this.onDeleteTaskButton.bind(this)}>
                                            <i className="fa fa-minus-circle"> </i> {gettext("Delete")}
                                        </button>
                                    </span>
                                )
                            }
                        })()}
                        &nbsp;
                        <button className="btn btn-sm btn-default cancel-save-task-button" type="button" onClick={this.onCancelButton.bind(this)}>
                            {gettext("Cancel")}
                        </button>
                    </div>
                </form>
            </div>
        );
    }
}

ProjectTaskForwardForm.propTypes = {
    parent: PropTypes.object.isRequired,
    project: PropTypes.object.isRequired,
}

function mapStateToProps(state, props) {
    const {environment, auth} = state;
    return {
        environment,
        user: auth.user,
        defaultTaskName: gettext('New Task')
    };
}

export default connect(mapStateToProps)(ProjectTaskForwardForm);
