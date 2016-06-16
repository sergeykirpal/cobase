import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router'
import {isMobile} from 'utils/environment.es6'
import {pathMatch} from 'utils/url.es6'
import {User} from 'classes/auth.es6'
import {ProjectsUrls} from 'constants/Urls.es6'
import Loading from 'components/Loading.jsx'
import {changeLocation} from 'actions/site.es6'
import {toggleActiveProjectTasksFilter, toggleProjectDrawingRightPanel, getActiveProject, resetActiveProjectTaskDetails, changeActiveProjectTaskDetailsViewMode} from 'actions/projects.es6'
import {modal} from 'react-redux-modal'
import ProjectTaskModalContainer from 'containers/projects/ProjectTaskModalContainer.jsx'

class Header extends Component {
    onAddProjectButton() {
        var {dispatch, project, projects} = this.props
        changeLocation(dispatch, `${ProjectsUrls.projectAdd}`)
    }

    onBackButton(){
        var {dispatch, activeProjectTaskDetailsViewMode, location} = this.props
        if(pathMatch(location.pathname, '/task/add/')){
            return appHistory.goBack()
        }
        if(pathMatch(location.pathname, '/task/') && activeProjectTaskDetailsViewMode != 'view'){
            return dispatch(changeActiveProjectTaskDetailsViewMode('view'))
        }else{
            return appHistory.goBack()
        }
    }

    onAddProjectTaskButton(taskType){
        var {dispatch, project, projects} = this.props
        dispatch(resetActiveProjectTaskDetails())
        dispatch(changeActiveProjectTaskDetailsViewMode('form'))

        if(isMobile('any')){
            changeLocation(dispatch, `${ProjectsUrls.projectTaskAdd(project.guid, taskType)}`)
        }else{
            modal.add(ProjectTaskModalContainer, {
                title: taskType == 'alert' ? gettext('New Alert') : gettext('New Task'),
                size: ('large'),
                data:{
                    project: project,
                    taskType: taskType,
                    afterTaskSave: function(referer, updatedTask) {
                        if(referer == 'addPinButton'){
                            dispatch(changeActiveProjectTaskDetailsViewMode('mapobj-edit'))
                            modal.add(ProjectTaskModalContainer, {
                                title: updatedTask.type == 'alert' ? gettext('Alert') : gettext('Task'),
                                size: ('large'),
                                data:{
                                    taskGuid: updatedTask.guid,
                                    project: project,
                                },
                                closeOnOutsideClick: false
                            });
                        }
                    }
                },
                closeOnOutsideClick: false
            });
        }
    }

    onProjectTasksFilterButton(){
        var {dispatch, project, projects} = this.props
        dispatch(toggleActiveProjectTasksFilter())
    }

    onUploadDrawingButton(){
        var {dispatch, project, projects} = this.props
        changeLocation(dispatch, ProjectsUrls.project(project.guid, 'upload'))
    }

    onToggleProjectDrawingRightPanelButton(){
        var {dispatch, project, projects} = this.props
        toggleProjectDrawingRightPanel(dispatch, true)
    }

    renderBackButton(){
        var {backButtonVisible} = this.props
        return <span className={`go-back-icon pull-left pointer ${backButtonVisible ? '' : 'hide'}`} onClick={this.onBackButton.bind(this)}><i className="glyphicon glyphicon-chevron-left"> </i>&nbsp;{gettext("BACK")}</span>
    }
    
    renderAddProjectButton(){
        return (
            <div onClick={this.onAddProjectButton.bind(this)} key="create-project-btn" className={`add-new-project-header-btn pointer text-center pull-right ${!isMobile('any') ? 'desctop' : ''}`}>
                <i className="fa fa-plus-square-o globalHeaderIconStyle"> </i>
                <div className="globalHeaderIconTextStyle">{gettext("NEW PROJECT")}</div>
            </div>
        )
    }

    renderAddProjectTaskButton(taskType){
        return (
            <div onClick={this.onAddProjectTaskButton.bind(this, taskType)} key="add-project-task-btn" className="pointer text-center display-inline-block-css" style={{paddingRight: '5px'}}>
                <i className="fa fa-plus-square-o globalHeaderIconStyle" > </i>
                <div className="globalHeaderIconTextStyle">{gettext(taskType == 'task' ? "NEW TASK" : "NEW ALERT")}</div>
            </div>
        )
    }

    renderProjectTasksFilterButton(){
        return (
            <div onClick={this.onProjectTasksFilterButton.bind(this)} key="filter-project-tasks-btn" className="filter-tasks-btn filterSearchButton pointer text-center display-inline-block-css">
                <i className="fa fa-search globalHeaderIconStyle"> </i>
                <div className="globalHeaderIconTextStyle">{gettext("FILTER")}</div>
            </div>
        )
    }
    
    renderToggleProjectDrawingRightPanelButton(){
        var {dispatch} = this.props
        return (
            <div onClick={this.onToggleProjectDrawingRightPanelButton.bind(this)} key="toggle-project-drawing-right-panel-btn" className="showRightSide pointer text-center">
                <i className="fa fa-tasks globalHeaderIconStyle"> </i> 
                <div className="globalHeaderIconTextStyle">{gettext("BROWSE")}</div>    
            </div>   
        )
    }
    
    renderUploadDrawingsButton(){
        var {dispatch, project} = this.props

        if(!project){
            return null
        }
        return (
            <div onClick={this.onUploadDrawingButton.bind(this)} key={`upload-project-${project.guid}-drawings-btn`} className="goToDrawingPage pointer text-center">
                <i className="si si-map globalHeaderIconStyle"> </i>
                <div className="globalHeaderIconTextStyle">{gettext("MANAGER")}</div>
            </div> 
        )
    }
    
    renderTitle(){
        var {location, user, title} = this.props

        var path = location.pathname
        var classValue = 'headerTitle '
        if(pathMatch(path, '/projects')){
            classValue += 'col-sm-10 col-md-10 col-lg-10 col-xs-7'
        }else if(pathMatch(path, '/drawing')){
             classValue += 'col-sm-9 col-md-10 col-lg-10 col-xs-6'
        }else if(pathMatch(path, '/tasks') || pathMatch(path, '/alerts') || pathMatch(path, '/overview')){
             classValue += 'col-sm-9 col-md-10 col-lg-10 col-xs-6'
        }else{
            classValue += 'col-sm-10 col-md-10 col-lg-10 col-xs-8'
        }

        return <div className={classValue}>{title}</div>
    }

    renderRightSide(){
        var {location, user, projects, project} = this.props
        var path = location.pathname
        var buttons = []
        var isProjectActive = project ? project.isActiveForUser(user.id) : false
        var classValue = 'no-padding text-right headerRightSide '
        if(pathMatch(path, '/projects') && !pathMatch(path, '/projects/add')) {
            classValue += 'col-sm-1 col-md-1 col-lg-1 col-xs-3'
            if (user.checkCompanyRole('manager')) {
                buttons.push(this.renderAddProjectButton())
            }
        } else if(pathMatch(path, '/drawing')){
            classValue += 'col-sm-2 col-md-1 col-lg-1 col-xs-4'
            if(isProjectActive && (project.checkUserRole(user.id, 'manager') || project.checkUserRole(user.id, 'director'))){
                buttons.push(this.renderUploadDrawingsButton(project))
            }
            buttons.push(this.renderToggleProjectDrawingRightPanelButton())

        } else if(pathMatch(path, '/tasks') || pathMatch(path, '/alerts') || pathMatch(path, '/overview')){
            var isAlerts = pathMatch(path, '/alerts')
            classValue += 'col-sm-2 col-md-1 col-lg-1 col-xs-4'
            if(project){
                if(isProjectActive){
                    buttons.push(this.renderAddProjectTaskButton(isAlerts ? 'alert' : 'task'))
                }
                buttons.push(this.renderProjectTasksFilterButton())
            }
        }else {
            classValue += 'col-sm-1 col-md-1 col-lg-1 col-xs-2'
        }

        return <div className={classValue}>{buttons}</div>
    }

    renderLeftSide(){
        var {location, backButtonVisible} = this.props
        return (
            <div className="col-xs-2 col-sm-1 col-md-1 col-lg-1 no-padding text-left headerLeftSide">
                {!backButtonVisible && isMobile('any') ? <i onClick={function(){window.slideout.toggle()}} className="mob-menu-icon fa fa-navicon"> </i> : null}
            </div>
        )
    }

    render(){
        var {user} = this.props

        if(!user.id){
            return <span />
        }

        return (
            <div className="header" style={isMobile('iOS') ? {paddingTop:`25px`} : {}}>
                {this.renderBackButton()}
                {this.renderLeftSide()}
                {this.renderTitle()}
                {this.renderRightSide()}
            </div>
        );
    }
}

function mapStateToProps(state, props) {
    const {environment, routing, auth, site, projects} = state;

    return {
        environment,
        location: routing.locationBeforeTransitions,
        user: auth.user,
        title: site.title,
        backButtonVisible: site.backButtonVisible,
        activeProjectTaskDetailsViewMode: projects.activeProject && projects.activeProject.taskDetails ? projects.activeProject.taskDetails.viewMode : null,
        projects,
        project: getActiveProject(projects)
    };
}

export default connect(mapStateToProps)(Header);
