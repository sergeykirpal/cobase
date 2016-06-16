import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router'
import {isMobile} from 'utils/environment.es6'
import Loading from 'components/Loading.jsx'
import {AuthUrls, ProjectsUrls, CompaniesUrls} from 'constants/Urls.es6'
import {activeClass, pathMatch} from 'utils/url.es6'
import {changeLocation} from 'actions/site.es6'
import {getActiveProject} from 'actions/projects.es6'
import ProjectsTasksCounter from 'components/projects/ProjectsTasksCounter.jsx'


class Menu extends Component {
    renderActiveProjectMenu(){
        const {dispatch, user, location, projects} = this.props
        var activeProject = getActiveProject(projects)
        var path = location.pathname

        if(!activeProject || !pathMatch(path, `/project/${activeProject.guid}`)){
            return
        }

        var projectUserRole = activeProject.getUserRole(user.id)
        var items = []
        if(user.checkCompanyRole('manager')){
            items.push(
                <li key="active-project-overview-link" className={`smi-project-overview ${activeClass(path, '/overview')}`}>
                    <a href="javascript://" onClick={changeLocation.bind(this, dispatch, ProjectsUrls.project(activeProject.guid, 'overview'))}>
                        <div className="col-md-3 col-xs-4 no-padding"></div>
                        <div className="col-md-9 col-xs-8 no-padding">{gettext("OVERVIEW")}</div>
                        <div className="clear"></div>
                    </a>
                </li>
            )
        }
        if(activeProject.checkUserRole(user.id, 'manager') || activeProject.checkUserRole(user.id, 'director')){
            items.push(
                <li key="active-project-alerts-link" className={`smi-project-alerts ${activeClass(path, '/alerts')}`}>
                    <a href="javascript://" onClick={changeLocation.bind(this, dispatch, ProjectsUrls.project(activeProject.guid, 'alerts'))}>
                        <div className="col-md-3 col-xs-4 no-padding"></div>
                        <div className="col-md-9 col-xs-8 no-padding">{gettext("ALERTS")} <ProjectsTasksCounter code="alerts" project={activeProject}/></div>
                        <div className="clear"></div>
                    </a>
                </li>
            )
        }
        items.push(
            <li key="active-project-tasks-link" className={`smi-project-tasks ${activeClass(path, '/tasks')}`}>
                <a href="javascript://" onClick={changeLocation.bind(this, dispatch, ProjectsUrls.projectTasks(activeProject.guid, 'tasks'))}>
                    <div className="col-md-3 col-xs-4 no-padding"></div>
                    <div className="col-md-9 col-xs-8 no-padding">{gettext("TASKS")} <ProjectsTasksCounter code={activeProject.checkUserRole(user.id, 'worker') ? 'total' : 'tasks'} project={activeProject}/></div>
                    <div className="clear"></div>
                </a>
            </li>,
            <li key="active-project-drawings-link" className={`smi-project-drawings ${activeClass(path, '/drawing')}`}>
                <a href="javascript://" onClick={changeLocation.bind(this, dispatch, ProjectsUrls.project(activeProject.guid, 'drawings'))}>
                    <div className="col-md-3 col-xs-4 no-padding"></div>
                    <div className="col-md-9 col-xs-8 no-padding">{gettext("DRAWINGS")}</div>
                    <div className="clear"></div>
                </a>
            </li>,
            <li key="active-project-reports-link" className={`smi-project-tasks ${activeClass(path, '/reports')}`}>
                <a href="javascript://" onClick={changeLocation.bind(this, dispatch, ProjectsUrls.project(activeProject.guid, 'reports'))}>
                    <div className="col-md-3 col-xs-4 no-padding"></div>
                    <div className="col-md-9 col-xs-8 no-padding">{gettext("REPORTS")}</div>
                    <div className="clear"></div>
                </a>
            </li>
        )
        return items
    }

    render(){
        const {dispatch, user, location, projects} = this.props
        var path = location.pathname

        if(!user.id){
            return <Loading />
        } 

        return (
            <ul>
                <li className={`mi-user-info user-info user-${user.id}-info`}>
                    <a href="javascript://" onClick={changeLocation.bind(this, dispatch, AuthUrls.profile)}>
                        <div className="user-photo" style={{'backgroundImage': `url(${user.thumbs.s.url})`}}></div>
                        <div className="user-name">{user.first_name}</div>
                        <div className="user-login">@{user.username}</div>
                        <div className="clear"></div>
                    </a>
                </li>
                <li className={`mi-projects ${activeClass(path, '/projects')}`}>
                    <a href="javascript://" onClick={changeLocation.bind(this, dispatch, ProjectsUrls.projects('active'))} >
                        <div className="col-md-3 col-xs-4 no-padding"><img src="/static/images/menu/noun.png"/></div>
                        <div className="col-md-9 col-xs-8 no-padding">{gettext("PROJECTS")} <span className="count pull-right hide"> </span></div>
                        <div className="clear"></div>
                    </a>
                </li>

                {this.renderActiveProjectMenu()}
                {(()=>{
                    if(user.checkCompanyRole('manager')){
                        return(
                            <li className={`mi-company-people ${activeClass(path, CompaniesUrls.company)}`} >
                                <a href="javascript://" onClick={changeLocation.bind(this, dispatch, CompaniesUrls.company)}>
                                    <div className="col-md-3 col-xs-4 no-padding"><img src="/static/images/menu/people.png"/></div>
                                    <div className="col-md-9 col-xs-8 no-padding">{gettext("COMPANY")}</div>
                                    <div className="clear"></div>
                                </a>
                            </li>
                        )
                    }
                })()}
                <li className={`mi-profile ${activeClass(path, AuthUrls.profile)}`}>
                    <a href="javascript://" onClick={changeLocation.bind(this, dispatch, AuthUrls.profile)} >
                        <div className="col-md-3 col-xs-4 no-padding"><img src="/static/images/menu/shape.png"/></div>
                        <div className="col-md-9 col-xs-8 no-padding">{gettext("PROFILE")}</div>
                        <div className="clear"></div>
                    </a>
                </li>
                <li className="mi-logout">
                    <a href={AuthUrls.logout}>
                        <div className="col-md-3 col-xs-4 no-padding"><img src="/static/images/menu/logout.png"/></div>
                        <div className="col-md-9 col-xs-8 no-padding">{gettext("LOGOUT")}</div>
                        <div className="clear"></div>
                    </a>
                </li>
            </ul>
        );
    }
}

function mapStateToProps(state, props) {
    const {environment, auth, routing, projects} = state;

    return {
        environment,
        user: auth.user,
        location: routing.locationBeforeTransitions,
        projects
    };
}

export default connect(mapStateToProps)(Menu);
