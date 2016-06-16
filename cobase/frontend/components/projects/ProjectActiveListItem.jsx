import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {Link} from 'react-router'
import {User} from 'classes/auth.es6'
import {ProjectsUrls} from 'constants/Urls.es6'
import ProjectTimer from 'components/projects/ProjectTimer.jsx'
import {truncate} from 'utils/string.es6'
import {changeLocation} from 'actions/site.es6'

class ProjectActiveListItem extends Component {
    componentDidMount(){
        const {dispatch, user, project, position} = this.props;
        if(position == 'last'){
            App.initHelpers('easy-pie-chart')
        }
    }

    render() {
        const {dispatch, user, project} = this.props;
        var company = user.company
        var title = company.type == 'support' && project.company.id != company.id ? project.title + ' - ' + project.company.title : project.title
        var projectsNewTasks = user.getVar('projectstasks', 'byproject')
        var projectsWorkingUsers = user.getVar('projectsworking')
        var newTasksCount = projectsNewTasks  && projectsNewTasks[project.id] ? projectsNewTasks[project.id]['tasks']['recent'].length : 0
        var newAlertsCount = projectsNewTasks && projectsNewTasks[project.id] ? projectsNewTasks[project.id]['alerts']['recent'].length : 0
        var workingUsersCount = projectsWorkingUsers && projectsWorkingUsers[project.id] ? projectsWorkingUsers[project.id].length : 0
        var userStatus = project.statusForUser(user.id)
        var userRole = project.getUserRole(user.id)

        return (
            <div className={`col-md-6 col-xs-12 project-item listitem project-item-${project.guid} project-item-${project.id}`} >
                <div className="project-item-box">
                    <div className="title col-xs-10 col-sm-10 col-md-10 col-lg-10">
                        <a className="pointer" onClick={changeLocation.bind(this, dispatch, ProjectsUrls.project(project.guid, 'tasks'))}>{truncate(title, 30, 30)}</a>
                        <div className="workplace">{project.workplace}</div>
                        <div className="address">{project.address}</div>
                    </div>

                    <div className="col-xs-2 col-sm-2 col-md-2 col-lg-2 no-padding">
                        <div className="col-xs-12 col-md-3 col-lg-3 col-sm-3 no-padding"></div>
                        <div className="col-xs-12 col-md-9 col-lg-9 col-sm-9 no-padding">
                            {(()=>{
                                if(userRole == "manager"){
                                    return(
                                        <div>
                                            <img className="shape" src="/static/images/shape.svg" />
                                            <div className="triangle-up-right"></div>
                                        </div>
                                    )
                                }else{
                                    return <div className="triangle-up-right-hide"></div>
                                }
                            })()}
                        </div>
                    </div>

                    <div className="clear"></div>
                    <div className="counts">
                        {(()=>{
                            if(userRole == "director"){
                                return(
                                   <div className="col-md-3 col-xs-12 col-sm-3 text-center-xs for-timer-box">
                                        <a className="btn btn-primary open-project-button pointer" onClick={changeLocation.bind(this, dispatch, ProjectsUrls.project(project.guid, 'tasks'))}>{gettext("OPEN")}</a>
                                    </div>
                                )
                            }else{
                                return <ProjectTimer project={project} />
                            }
                        })()}

                        {(()=>{
                            if(userRole && (userRole == "manager" || userRole == "director")){
                                return(
                                   <div>
                                        <div className="col-md-3 col-xs-4 col-sm-3 text-center">
                                            <span className="pointer" onClick={changeLocation.bind(this, dispatch, ProjectsUrls.project(project.guid, 'reports'))}>
                                                <div className="cobase-circle-red-dot" style={{display: workingUsersCount ? 'block' : 'none'}}></div>
                                                <i className="si si-users icon"> </i><br />
                                                {gettext("PERSONS")}<br />{workingUsersCount}
                                            </span>
                                        </div>
                                        <div className="col-md-3 col-xs-4 col-sm-3 text-center">
                                            <span className="pointer" onClick={changeLocation.bind(this, dispatch, ProjectsUrls.project(project.guid, 'tasks'))}>
                                                <div className="cobase-circle-red-dot" style={{display: newTasksCount ? 'block' : 'none'}} ></div>
                                                <i className="si si-check icon"> </i><br />
                                                {gettext("TASKS")}<br /><span>{newTasksCount}</span>
                                            </span>
                                        </div>
                                        <div className="col-md-3 col-xs-4 col-sm-3 text-center">
                                            <span className="pointer" onClick={changeLocation.bind(this, dispatch, ProjectsUrls.project(project.guid, 'alerts'))}>
                                                <div className="cobase-circle-red-dot" style={{display: newAlertsCount ? 'block' : 'none'}} ></div>
                                                <i className="si si-bell icon"> </i><br />
                                                {gettext("ALERTS")}<br /><span>{newAlertsCount}</span>
                                            </span>
                                        </div>
                                        <div className="clear"></div>

                                        <div className="project-icons mobile-buttons hidden-sm hidden-md hidden-lg bg-gray-light">
                                            <div className={`col-md-3 col-xs-4 col-sm-3 text-center focusoff-css ${project.company_id != company.id ? 'ccc' : ''}`}
                                                 style={{borderRight: 'solid 1px #fff'}}
                                                 onClick={changeLocation.bind(this, dispatch, ProjectsUrls.project(project.guid, 'share'), project.company_id == company.id)} >
                                                <span className="si si-share"> </span>
                                                <div className="focusoff-text-css">{gettext("SHARE")}</div>
                                            </div>

                                            <div className="col-md-3 col-xs-4 col-sm-3 text-center focusoff-css" style={{borderRight: 'solid 1px #fff'}} onClick={changeLocation.bind(this, dispatch, ProjectsUrls.project(project.guid, 'upload'))} >
                                                <span className="si si-map"> </span>
                                                <div className="focusoff-text-css">{gettext("DRAWINGS")}</div>
                                            </div>

                                            <div className="col-md-3 col-xs-4 col-sm-3 text-center focusoff-css" onClick={changeLocation.bind(this, dispatch, ProjectsUrls.project(project.guid, 'update'))}>
                                                <span className="si si-settings"> </span>
                                                <div className="focusoff-text-css">{gettext("EDIT PROJECT")}</div>
                                            </div>
                                            <div className="clear"></div>
                                        </div>
                                    </div>
                                )
                            }
                        })()}
                    </div>
                    <div className="clear"></div>
                    {(()=>{
                        if(userRole && (userRole == "manager" || userRole == "director")){
                            return(
                               <ul className="project-icons block-options hidden-xs">
                                    <li>
                                        <button
                                            className={`focusoff-css ${project.company_id != company.id ? 'ccc' : ''}`}
                                            type="button"
                                            onClick={changeLocation.bind(this, dispatch, ProjectsUrls.project(project.guid, 'share'), project.company_id == company.id)}>
                                            <span className="si si-share"> </span>
                                            <div className="focusoff-text-css">{gettext("SHARE")}</div>
                                        </button>
                                    </li>
                                    <li>
                                        <button className="focusoff-css" type="button" onClick={changeLocation.bind(this, dispatch, ProjectsUrls.project(project.guid, 'upload'))}>
                                            <span className="si si-map"> </span>
                                            <div className="focusoff-text-css">{gettext("DRAWINGS")}</div>
                                        </button>
                                    </li>
                                    <li>
                                        <button className="focusoff-css" type="button" onClick={changeLocation.bind(this, dispatch, ProjectsUrls.project(project.guid, 'update'))}>
                                            <span className="si si-settings"> </span>
                                            <div className="focusoff-text-css">{gettext("EDIT PROJECT")}</div>
                                        </button>
                                    </li>
                                </ul>
                            )
                        }
                    })()}
                    <div className="clear"></div>
                </div>
            </div>
        )
    }
}

ProjectActiveListItem.propTypes = {
    project: PropTypes.object.isRequired,
    position: PropTypes.string,
}

function mapStateToProps(state, props) {
    const {environment, auth} = state;
    return {
        environment,
        user: auth.user,
        project: props.project
    };
}

export default connect(mapStateToProps)(ProjectActiveListItem);
