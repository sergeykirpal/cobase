import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {Link} from 'react-router'
import {User} from 'classes/auth.es6'
import ProjectTimer from 'components/projects/ProjectTimer.jsx'
import {truncate} from 'utils/string.es6'
import {changeLocation} from 'actions/site.es6'
import {ProjectsUrls} from 'constants/Urls.es6'
import {PUTRequest, POSTRequest, GETRequest} from 'utils/api.es6'
import {activeProjectUpdated} from 'actions/projects.es6'
import * as config from 'constants/Config.es6';
import {Project} from 'classes/projects/common.es6'


class ProjectArchivedListItem extends Component {
    onActivateProjectButton(projectId){
        const {dispatch} = this.props;
        swal({
            title: gettext("Are you sure?"),
            text: gettext("If you activate the project, it will appear in active tab"),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: gettext("Yes, activate it!"),
            cancelButtonText: gettext("No, cancel!"),
            closeOnConfirm: true,
            closeOnCancel: false
        }, function(isConfirm){
            if (isConfirm) {
                var url = `${ProjectsUrls.api.project(projectId)}?fields=${config.PROJECTS_ACTIVE_PROJECT_FIELDS}`
                var params = {'company_status': 'active'}
                PUTRequest(url, params, function (project) {
                    project = new Project(project)
                    dispatch(activeProjectUpdated(project))
                })
            } else {
                swal({
                    title: gettext('Cancelled'),
                    text: gettext("Your project is safe)"),
                    type: "error",
                    timer: 2000,
                    showConfirmButton: false
                })
            }
        })
    }

    componentWillUnmount(){

    }

    componentDidMount(){

    }

    render() {
        const {dispatch, user, project} = this.props;
        var company = user.company
        var title = company.type == 'support' && project.company.id != company.id ? project.title + ' - ' + project.company.title : project.title
        var userStatus = project.statusForUser(user.id)
        var projectUserRole = project.getUserRole(user.id)
        var isUserCompanyManager = user.checkCompanyRole('manager')
        var activeProjectsLimit = user.getVar('projectsactive', 'company_projectsactive_count_limit')
        var userHasActiveProjectsLimitation = activeProjectsLimit !== null
        var userHasActiveProjectPermission = user.checkPermission('projectsactive', 'projectactive', 'create')
        var userMayActivateProject = Boolean(isUserCompanyManager && (!userHasActiveProjectsLimitation || userHasActiveProjectPermission))

        return (
            <div className={`col-md-6 col-xs-12 project-archived project-item listitem project-item-${project.guid} project-item-${project.id}`} >
                <div className="project-item-box">
                    <div className="title col-xs-10 col-sm-10 col-md-10 col-lg-10">
                        <Link id={`project-tasks-link-${project.guid}`} to={ProjectsUrls.project(project.guid, 'tasks')}>{truncate(title, 30, 30)}</Link>
                        <div className="workplace">{project.workplace}</div>
                        <div className="address">{project.address}</div>
                    </div>

                    <div className="col-xs-2 col-sm-2 col-md-2 col-lg-2 no-padding">
                        <div className="col-xs-12 col-md-3 col-lg-3 col-sm-3 no-padding"></div>
                        <div className="col-xs-12 col-md-9 col-lg-9 col-sm-9 no-padding">
                            {(()=>{
                                if(projectUserRole == "manager"){
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
                        <div className="col-md-3 col-xs-12 col-sm-3 text-center-xs for-timer-box">
                            <Link className="btn btn-primary open-project-button" to={ProjectsUrls.project(project.guid, 'tasks')}>{gettext("OPEN")}</Link>
                            {userMayActivateProject ? <button onClick={this.onActivateProjectButton.bind(this, project.id)} type="button" style={{marginTop: '15px'}} className="btn btn-success project-activate-btn project-activate-css hidden-sm hidden-md hidden-lg">{gettext('Activate')}</button> : null}
                        </div>

                        {(()=>{
                            if(projectUserRole == "manager" || projectUserRole == "director"){
                                return(
                                   <div>
                                        <div className="col-md-3 col-xs-4 col-sm-3 text-center opacity-css">
                                            <span className="pointer">
                                                <i className="si si-users icon"> </i><br />
                                                {gettext("PERSONS")}
                                            </span>
                                        </div>
                                        <div className="col-md-3 col-xs-4 col-sm-3 text-center opacity-css">
                                            <span className="pointer">
                                                <i className="si si-check icon"> </i><br />
                                                {gettext("TASKS")}
                                            </span>
                                        </div>
                                        <div className="col-md-3 col-xs-4 col-sm-3 text-center opacity-css">
                                            <span className="pointer">
                                                <i className="si si-bell icon"> </i><br />
                                                {gettext("ALERTS")}
                                            </span>
                                        </div>
                                        <div className="clear"></div>

                                        <div className="project-icons mobile-buttons hidden-sm hidden-md hidden-lg bg-gray-light opacity-css">
                                            <div className={`col-md-3 col-xs-4 col-sm-3 text-center focusoff-css`}
                                                 style={{borderRight: 'solid 1px #fff'}} >
                                                <span className="si si-share"> </span>
                                                <div className="focusoff-text-css">{gettext("SHARE")}</div>
                                            </div>

                                            <div className="col-md-3 col-xs-4 col-sm-3 text-center focusoff-css"
                                                 style={{borderRight: 'solid 1px #fff'}} >
                                                <span className="si si-map"> </span>
                                                <div className="focusoff-text-css">{gettext("DRAWINGS")}</div>
                                            </div>

                                            <div className="col-md-3 col-xs-4 col-sm-3 text-center focusoff-css">
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

                    {userMayActivateProject ? <button onClick={this.onActivateProjectButton.bind(this, project.id)} type="button" className="btn btn-success project-activate-btn project-activate-css hidden-xs">{gettext('Activate')}</button> : null}
                    {(()=>{
                        if(projectUserRole == "manager" || projectUserRole == "director"){
                            return(
                               <ul className="project-icons block-options hidden-xs opacity-css">
                                    <li>
                                        <button
                                            className={`focusoff-css`}
                                            type="button">
                                            <span className="si si-share"> </span>
                                            <div className="focusoff-text-css">{gettext("SHARE")}</div>
                                        </button>
                                    </li>
                                    <li>
                                        <button className="focusoff-css" type="button">
                                            <span className="si si-map"> </span>
                                            <div className="focusoff-text-css">{gettext("DRAWINGS")}</div>
                                        </button>
                                    </li>
                                    <li>
                                        <button className="focusoff-css" type="button">
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

ProjectArchivedListItem.propTypes = {
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

export default connect(mapStateToProps)(ProjectArchivedListItem);
