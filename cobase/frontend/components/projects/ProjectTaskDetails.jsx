import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {isMobile} from 'utils/environment.es6'
import {updateActiveProjectTaskUserLink, fetchActiveProjectTaskDetailsIfNeed, selectActiveProjectImageTask, changeActiveProjectTaskDetailsViewMode} from 'actions/projects.es6'
import {changeLocation} from 'actions/site.es6'
import {ProjectsUrls} from 'constants/Urls.es6'
import ProjectTaskDetailsTime from 'components/projects/ProjectTaskDetailsTime.jsx'
import ProjectTaskDetailsImages from 'components/projects/ProjectTaskDetailsImages.jsx'
import ProjectTaskDetailsButtons from 'components/projects/ProjectTaskDetailsButtons.jsx'
import ProjectTaskDetailsUsers from 'components/projects/ProjectTaskDetailsUsers.jsx'


class ProjectTaskDetails extends Component {
    componentDidMount(){
        this.markTaskAsReadForUser()
    }

    markTaskAsReadForUser(){
        const {dispatch, user, task, project} = this.props;
        if(!task || !project){
            return
        }
        var userLink = task.getUser(user.id)
        if(!userLink || userLink.read){
            return
        }

        dispatch(updateActiveProjectTaskUserLink(project, userLink, {read:'now', jssid: '1234'}))
    }

    onEditTaskButton(){
        var {dispatch, project, task} = this.props
        dispatch(changeActiveProjectTaskDetailsViewMode('form'))
    }

    onEditTaskForwardedButton(){
        var {dispatch, project, task} = this.props

        dispatch(changeActiveProjectTaskDetailsViewMode('forward-form'))
    }

    renderProjectTaskForwardUsers(){
        const {dispatch, environment, task, project} = this.props;

        if(task.child && !task.child.deleted){
            return(
               <div>
                    <h4 className="block-title sub-block-title-css">{gettext("FORWARDED")}</h4>
                    <ProjectTaskDetailsUsers  task={task.child} project={project} afterLinkUpdate={() => {dispatch(fetchActiveProjectTaskDetailsIfNeed(task.guid, true))}}/>
               </div>
            )
        }
    }

    render() {
        const {dispatch, environment, task, project, user, onOpenDrawingButton} = this.props;
        var projectUserRole = project.getUserRole(user.id)
        var projectActive = project.isActiveForUser(user.id)
        var isTaskEditable = projectActive && task.isEditableForUser(user.id)
        var isTaskForwarded = projectActive && task.isForwarded(user.id)
        var imageGuid = task.image ? task.image.guid : null
        var userLink = task.getUser(user.id)

        return (
            <div className={`project-task-view project-task-${task.id}-view project-task-${task.guid}-view`}>
                <div className="project-task-view-box col-xs-12 col-sm-12 col-md-12 col-lg-12">
                    <div className="block block-transparent">
                        <div className="block-content no-padding-left-right">
                            {(()=>{
                                if(isTaskEditable){
                                    return(
                                       <div className="task-btn pointer text-center pull-right" onClick={this.onEditTaskButton.bind(this)}>
                                            <i className="si si-settings" style={{fontSize: '20px', color: '#000'}}> </i><br />
                                            <div style={{fontWeight: 'bold', fontSize: '10px'}} >
                                                {task.type != 'alert' ? gettext("EDIT TASK") : gettext("EDIT ALERT")}
                                            </div>
                                        </div>
                                    )
                                }
                            })()}
                            {(()=>{
                                if(isTaskForwarded){
                                    return(
                                       <div className="task-btn pointer text-center pull-right" onClick={this.onEditTaskForwardedButton.bind(this)}>
                                            <i className="si si-settings" style={{fontSize: '20px', color: '#000'}}> </i><br />
                                            <div style={{fontWeight: 'bold', fontSize: '10px'}} >
                                                {gettext("EDIT FORWARDED")}
                                            </div>
                                        </div>
                                    )
                                }
                            })()}

                            {(()=>{
                                if(task.type == 'alert'){
                                    return(
                                       <div>
                                            <h3 className="block-title text-danger"><i className="fa fa-bell" title="Alert"> </i>{gettext("ALERT")}</h3>
                                            <br/>
                                        </div>
                                    )
                                }
                            })()}

                            <h3 className="block-title" style={{marginBottom: '10px', width:'90%'}}>{task.title}</h3>
                            <div className="clear"></div>
                            <p className="white-space task-description-css">{task.description}</p>

                            <div className="project-task">
                                <div className="task-icons">
                                    {(()=>{
                                        if(task.speciality == 'extra' && (projectUserRole == 'manager' || projectUserRole == 'director')){
                                            return(
                                               <div className="form-group">
                                                    <div className="item item-circle bg-danger text-white-op" href="javascript://" style={{lineHeight:'32px'}}>
                                                        <i className="glyphicon glyphicon-asterisk"> </i>
                                                    </div>
                                                    <strong>&nbsp;{gettext("Extra work")}</strong>
                                                </div>
                                            )
                                        }
                                    })()}
                                    {(()=>{
                                        if(task.alert_type == 'global'){
                                            return(
                                               <div className="form-group">
                                                    <div className="item item-circle bg-flat-lighter text-white-op" href="javascript://">
                                                        <i className="fa fa-connectdevelop"> </i>
                                                    </div>
                                                    <strong>&nbsp;{gettext("Global Alert")}</strong>
                                                </div>
                                            )
                                        }
                                    })()}
                                </div>
                            </div>
                            <ProjectTaskDetailsImages task={task} project={project} />
                            <div className="clear"></div>
                            
                            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 project-task">
                                <div className="task-icons">
                                    {(()=>{
                                        if(imageGuid && imageGuid.length && userLink){
                                            return(
                                               <div>
                                                    <a className="item item-circle bg-default-light text-white-op select-task-mapobj-btn" onClick={onOpenDrawingButton.bind(this, imageGuid)} href="javascript://">
                                                        <i className="fa fa-map-marker"> </i>
                                                    </a>
                                                    &nbsp;
                                                    <a style={{color: '#000', 'textDecoration': 'underline'}} onClick={onOpenDrawingButton.bind(this, imageGuid)} href="javascript://">
                                                        {gettext("OPEN DRAWING")}
                                                    </a>
                                                </div>
                                            )
                                        }
                                    })()}
                                </div>
                            </div>
                            <div className="clear"></div>
                        </div>
                        
                        <div className="block-header no-padding-left-right">
                            <h3 className="block-title">{gettext("DETAILS")}</h3>
                            <h4 className="block-title sub-block-title-css">{gettext("TASK OWNER")}</h4>
                            <div style={{padding: '5px 0'}}>
                                <span style={{width:'70px', display: 'inline-block'}}> </span>
                                <i className="fa fa-user-secret task-owner"> </i>{task.owner ? task.owner.name : ''}
                            </div>
                            <h4 className="block-title sub-block-title-css">{gettext("ASSIGNED TO")}</h4>
                            <ProjectTaskDetailsUsers task={task} project={project} />
                            <div className="clear"></div>
                            {this.renderProjectTaskForwardUsers()}
                            <div className="clear"></div>
                            <ProjectTaskDetailsTime task={task} project={project} />
                        </div>
                    </div>
                    <ProjectTaskDetailsButtons task={task} project={project} />
                </div>
                <div className="clear"></div>
            </div>
        );
    }
}

ProjectTaskDetails.propTypes = {
    task: PropTypes.object.isRequired,
    onOpenDrawingButton: PropTypes.func.isRequired,
    project: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
    const {environment, auth} = state;
    return {
        environment,
        user: auth.user
    };
}

export default connect(mapStateToProps)(ProjectTaskDetails);
