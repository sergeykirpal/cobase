import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {ProjectTaskManager} from 'classes/projects/projecttask.es6'
import {isMobile} from 'utils/environment.es6'
import {guid} from 'utils/string.es6'
import {bytesToSize} from 'utils/file.es6'
import {ProjectsUrls} from 'constants/Urls.es6'
import * as config from 'constants/Config.es6';
import {fetchActiveProjectTaskDetailsIfNeed, activeProjectTaskDetailsImageCreated} from 'actions/projects.es6'
import {DELETERequest} from 'utils/api.es6'


class ProjectTaskFormImages extends Component {
    componentDidMount(){
        ProjectTaskManager.initPhotoSwipe('.my-gallery')
        this.bindButtons()
    }

    bindButtons(){
        const {dispatch, environment, task, project, user, activeProjectTask} = this.props;

        $('.remove-file-btn').click(function () {
            var imageId = $(this).data('imageid')
            swal({
                title: gettext("Are you sure?"),
                text: gettext("You will not be able to recover this imaginary file!"),
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: gettext("Yes, delete it!"),
                cancelButtonText: gettext("No, cancel!"),
                closeOnConfirm: true,
                closeOnCancel: false
            }, function(isConfirm){
                if (isConfirm) {
                    DELETERequest(ProjectsUrls.api.projectTaskImage(project.id, imageId), function () {
                        dispatch(fetchActiveProjectTaskDetailsIfNeed(activeProjectTask.guid, true))
                    })
                } else {
                    swal(gettext("Cancelled"), gettext("Your imaginary file is safe :)"), "error")
                }
            })

            return false
        })

        $('.upload-project-task-image').fileupload({
            dataType: 'json',
            singleFileUploads: true,
            autoUpload: true,
            add: (e, data) => {
                var jsguid = guid()
                var error = null
                var cfg = config.PROJECTS_PROJECT_TASK_UPLOAD_LIMITATIONS
                data.url = ProjectsUrls.api.projectTaskImages(project.id)
                data.formData = {'jssid':'1234', jsguid:jsguid}
                
                if(task){
                    var taskId = task.is_subtask ? task.parent_id : task.id
                    data.formData['task'] = taskId
                }

                $.each(data.files, function (index, file) {
                    if (file.type.length && !cfg.accept_file_types.test(file.type)) {
                        error = gettext('Not an accepted file type: ') + file.type
                    }
                    if (file.name.length && !cfg.accept_file_extensions.test(file.name)) {
                        error = gettext('Not an accepted filename: ') + file.name
                    }
                    if (file.size && file.size > cfg.max_file_size) {
                        error = gettext('Filesize is too big. Allowed ') + bytesToSize(cfg.max_file_size)
                    }

                    if (error) {
                        $('.project-task-images-box .alert').removeClass('hide').text(error);
                    } else {
                        $('.cancel-uploading').removeClass('hide')
                        $('.cancel-uploading a').click(function (e) {
                            data.abort()
                            return false
                        })
                        $('.progress').removeClass('hide')
                        $('.project-task-images-box .alert').addClass('hide');
                        data.submit()
                    }
                })
            },
            done: (e, data) => {
                $('.progress').addClass('hide')
                $('.cancel-uploading').addClass('hide')
                if(task){
                    dispatch(fetchActiveProjectTaskDetailsIfNeed(activeProjectTask.guid, true))
                }else{
                    var image = data.jqXHR.responseJSON
                    dispatch(activeProjectTaskDetailsImageCreated(image))
                }

            },
            progress: (e, data) => {
                var $progress = $('.progress')
                var progress = parseInt(data.loaded / data.total * 100, 10)
                $progress.find('.persent').text(progress + '%')
                $progress.find('.progress-bar').attr({
                    style: 'width:' + progress + '%',
                    'aria-valuenow': progress
                })
            },
            stop: function (e) {
                $('.cancel-uploading').addClass('hide')
                $('.progress').addClass('hide')
                $('.progress .progress-bar').attr({
                    'style': 'width:0',
                    'aria-valuenow': '0'
                })                
            },
        }).prop('disabled', !$.support.fileInput).parent().addClass($.support.fileInput ? undefined : 'disabled')
    }
  
    renderImages(){
        const {dispatch, environment, task, project, user, images} = this.props;
        
        var items = []
        for(let image of images){
            items.push(
                <figure key={`task-image-update-${image.id}`}  data-jsguid={image.jsguid} className={`col-xs-6 col-sm-3 col-md-3 col-lg-3 margin-bottom-5 project-task-image project-task-image-${image.jsguid}`} itemProp="associatedMedia" itemScope="" itemType="http://schema.org/ImageObject">
                    <a href={image.thumbs.big.src} className="img-container" itemProp="contentUrl" data-size={`${image.thumbs.big.width}x${image.thumbs.big.height}`} >
                        <button data-imageid={image.id} className="btn btn-danger btn-xs remove-file-btn"><i title={gettext("Remove")} className="glyphicon glyphicon-remove"> </i></button>
                        <img src={image.thumbs.x.src} itemProp="thumbnail" alt="" className="file-thumb img-responsive" />
                        <input type="hidden" name="images" defaultValue={image.id} />
                    </a>
                </figure>
            )
        }
        
        return items
    }

    render(){
        return (
            <div className="form-group project-task-images-box">
                <span className="btn fileinput-button add-image-button" style={{marginTop: '4px'}}> <i className="glyphicon glyphicon-plus"> </i> <span>{gettext("Add Image")}</span>
                    <input className="fileupload upload-project-task-image" type="file" name="files" multiple={!isMobile('iOS')}/>
                </span>
                <div className="progress progress-top no-position hidden-xs hide">
                    <div className="progress-bar progress-bar-danger" role="progressbar" aria-valuemin="0" aria-valuemax="100"><span className="persent">0%</span></div>
                </div>
                <div style={{marginBottom: '7px', marginTop: '7px', paddingLeft: '14px'}} className="cancel-uploading hide">
                    <button type="reset" className="btn btn-warning">
                        <i className="glyphicon glyphicon-ban-circle"> </i> <span>{gettext("Cancel Upload")}</span>
                    </button>
                </div>
                <div className="alert hide"></div>
                <div className="clear"></div>
                <div className="project-task-addedit-images my-gallery" itemScope="" itemType="http://schema.org/ImageGallery">
                    {this.renderImages()}
                </div>
                <div className="clear"></div>
            </div>
        )
    }
}

ProjectTaskFormImages.propTypes = {
    project: PropTypes.object.isRequired,
    images: PropTypes.array.isRequired,
}


function mapStateToProps(state, props) {
    const {environment, auth, projects} = state;
    return {
        environment,
        user: auth.user,
        activeProjectTask: projects.activeProject.taskDetails.task
    };
}

export default connect(mapStateToProps)(ProjectTaskFormImages);
