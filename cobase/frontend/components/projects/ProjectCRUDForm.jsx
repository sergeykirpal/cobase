import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {ProjectCRUDManager} from 'classes/projects/project.es6'
import {activeProjectCompanyUsersChanged} from 'actions/projects.es6'
import {ProjectsUrls, AuthUrls} from 'constants/Urls.es6'
import {PUTRequest, POSTRequest, GETRequest, DELETERequest} from 'utils/api.es6'
var moment = require('moment');

class ProjectCRUDForm extends Component {
    componentDidMount(){
        this.initManager()
    }

    componentWillUnmount(){
        this.removeManager()
    }

    componentWillUpdateProps(nextProps){
        const {dispatch, user, access, project} = nextProps;

        if(window.projectCRUDMngr){
            projectCRUDMngr.companyUserLinks = project['companyusers']
        }
    }

    initManager(){
        const {dispatch, user, access, project} = this.props;

        window.projectCRUDMngr = new ProjectCRUDManager({
            box: '.project-form-box',
            project: project,
            user: user,
            dispatch: dispatch,
            companyUserLinks: project['companyusers']
        })
        projectCRUDMngr.run()
    }

    removeManager(){
        if(window.projectCRUDMngr){
            delete window.projectCRUDMngr
        }
    }

    onCancelButton(){
        appHistory.goBack()
    }

    renderProjectManager(){
        const {dispatch, user, height, project} = this.props;
        var isCompanyManager = user.checkCompanyRole('manager')
        var projectManagerLink

        for(let companyUserLink of project['companyusers']){
            if(companyUserLink.project_role == 'manager'){
                projectManagerLink = companyUserLink
                break
            }
        }

        if(isCompanyManager){
            return(
                <div className="form-group">
                    <label>{gettext("PROJECT MANAGER")}</label>
                    <div className="input-group">
                        <span className="input-group-addon"><i className="fa fa-user-plus"> </i></span>
                        <input placeholder={gettext("Enter Name")}
                               data-manageremail="true"
                               data-manageremail-error={gettext("Wrong email address")}
                               data-error={gettext('This field may not be blank.')}
                               required={true}
                               id="id_manager"
                               type="text"
                               name="manager"
                               className="form-control project-manager"
                               defaultValue={projectManagerLink ? `${projectManagerLink.name}(${projectManagerLink.email})` : ''}
                        />
                        <div id="project-manager-autocomplete" style={{paddingTop: '33px'}}></div>
                    </div>
                    <div className="help-block with-errors"></div>
                </div>
            )
        }else{
            return <input type="hidden" id="id_manager" name="manager" defaultValue={projectManagerLink ? projectManagerLink.email : ''} />
        }
    }

    onProjectWorkerButton(event){
        const {dispatch, user, project} = this.props;
        let companyUsers = [].concat(project['companyusers'])
        var email = event.target.value
        let index = 0
        for(let companyUserLink of companyUsers){
            if(companyUserLink.email == email){
                companyUsers[index]['project_role'] = event.target.checked ? 'worker' : null
                dispatch(activeProjectCompanyUsersChanged(companyUsers))
                break
            }
            index += 1
        }
    }

    renderProjectWorkers(){
        const {dispatch, user, project} = this.props;

        var items = []
        for(let companyUserLink of project['companyusers']){
            if (companyUserLink.role == 'worker' && companyUserLink.project_role != 'manager'){
                items.push(
                    <tr className="user-worker" key={`project-user-worker-${companyUserLink.email}-${companyUserLink.project_role}`}>
                        <td>
                            <label className="css-input css-checkbox  css-checkbox-primary">
                                <input onChange={this.onProjectWorkerButton.bind(this)} checked={Boolean(companyUserLink.project_role == 'worker')} name="worker" defaultValue={companyUserLink.email} type="checkbox" />
                                <span> </span>
                            </label>
                        </td>
                        <td className="white-space">{companyUserLink.user.name}</td>
                        <td>
                            <div className="white-space stusespedd">
                                {companyUserLink.user.email}
                                <br />
                                {companyUserLink.type=="invite" ? <span className="label label-danger">{gettext("Pending")}</span> : null}
                            </div>
                        </td>
                    </tr>
                )
            }
        }

        return <tbody className="workers searchable">{items}</tbody>
    }

    onArchiveProjectButton(){
        swal({
            title: gettext("Are you sure?"),
            text: gettext("If you archive the project you it will become inactive. You could only see and read information but not send or receive tasks for example."),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: gettext("Yes, archive it!"),
            cancelButtonText: gettext("No, cancel!"),
            closeOnConfirm: true,
            closeOnCancel: false
        }, function(isConfirm){
            if (isConfirm) {
                let $form = $('.project-form-box')
                $form.find('.company-status-input').val('archived')
                $form.find('form').submit()
                return false
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

    onDeleteProjectButton(){
        const {dispatch, user, project} = this.props;

        swal({
            title: gettext("Are you sure?"),
            text: gettext("You will not be able to recover this project!"),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: gettext("Yes, delete it!"),
            cancelButtonText: gettext("No, cancel!"),
            closeOnConfirm: true,
            closeOnCancel: false
            }, function(isConfirm){
            if (isConfirm) {
                DELETERequest(ProjectsUrls.api.project(project.id), function () {
                    appHistory.goBack()
                })
            } else {
                swal(gettext("Cancelled"), gettext("Your project is safe :)"), "error")
            }
        })
    }

    onCancelButton(){
        appHistory.goBack()
    }

    render(){
        const {dispatch, user, project} = this.props;
        var isActiveProject = project.id ? project.isActiveForUser(user.id) : true
        var isCompanyManager = user.checkCompanyRole('manager')

        return (
            <div className="project-form-box" key={`project-form-${project.guid}`}>
                {project.id && !isActiveProject ? <div className="projects-cobase-block-content-in-block"></div> : null}
                <div className="content project-details project-edit-form" style={{opacity: !isActiveProject?'0.2':'1'}} >
                    <form method="post" role="form" id="save-project-form">
                        <h3>{gettext("PROJECT DETAILS")}</h3>

                        <div className={`form-group`}>
                            <label>{gettext("PROJECT NAME")}</label>
                            <input data-error={gettext('This field may not be blank.')} required className="form-control" id="id_title" name="title" placeholder={gettext('Enter a project name')} type="text" defaultValue={project.title} />
                            <div className="help-block with-errors"></div>
                        </div>

                        <div className="form-group">
                            <label>{gettext("LOCATION")}</label>

                            <div className="input-group">
                                <span className="input-group-addon find-project-location-btn pointer"><i className="fa fa-map-marker"> </i></span>
                                <input className="form-control" id="id_address" maxLength="255" name="address" placeholder={gettext('Enter a project location')} type="text" defaultValue={project.address} />
                                <input id="id_coordinates" type="hidden" name="coordinates" />
                            </div>
                        </div>

                        <div className="form-group map map-canvas-box" style={{display: 'none'}}>
                            <div id="map-canvas" className="fadeIn" style={{width:'100%', height:'300px',display: 'none'}}></div>
                            <i>*{gettext("Drag location pin to correct location if it is unaccurate. Project perimeter is counted 2KM around this pin.")}</i>
                        </div>

                        <h3>{gettext("TIMEFRAME")}</h3>
                        <div className="row" style={{marginRight: '-10px'}}>
                            <div className="form-group time-frame time-frame-left  col-md-6 col-xs-12">
                                <label>{gettext("PROJECT START")}</label>
                                <div className="input-group date">
                                    <span className="input-group-addon"><i className="si si-calendar"> </i></span>
                                    <input readoOnly={true} type="text" name="start_date" id="id_start_date" className="form-control iphoneInput" placeholder={gettext("Start Date")} defaultValue={project.start_date ? moment(project.start_date).format('D/M/YYYY') : ''} />
                                    <div id="datepicker-start"></div>
                                </div>
                            </div>
                            <div className="form-group time-frame time-frame-right  col-md-6 col-xs-12">
                                <label>{gettext("PROJECT END")}</label>
                                <div className="input-group date">
                                    <span className="input-group-addon"><i className="si si-calendar"> </i></span>
                                    <input readoOnly={true} type="text" name="end_date" id="id_end_date" className="form-control iphoneInput" placeholder={gettext("End Date")} defaultValue={project.end_date ? moment(project.end_date).format('D/M/YYYY') : ''} />
                                    <div id="datepicker-end"></div>
                                </div>
                            </div>
                        </div>
                        <div className="#picker-container"></div>

                        <div className="row" style={{marginRight: '-10px'}}>
                            <div className="form-group time-frame time-frame-left  col-md-6 col-xs-12">
                                <label>{gettext("WORKDAY START")}</label>
                                <div className="input-group" id="id_workday_start">
                                    <span className="input-group-addon"><i className="glyphicon glyphicon-time"> </i></span>
                                    <input data-field="time" type="text" id="workday_start" name="workday_start" className="form-control iphoneInput" placeholder={gettext("Start Time")} defaultValue={project.workday_start_formatted} />
                                </div>
                            </div>
                            <div className="form-group time-frame time-frame-right  col-md-6 col-xs-12">
                                <label>{gettext("WORKDAY END")}</label>
                                <div className="input-group" id="id_workday_end">
                                    <span className="input-group-addon"><i className="glyphicon glyphicon-time"> </i></span>
                                    <input data-field="time" type="text" id="workday_end" name="workday_end" className="form-control iphoneInput"  placeholder={gettext("End time")} defaultValue={project.workday_end_formatted} />
                                </div>
                            </div>
                        </div>

                        <h3>{gettext("WORKERS FOR PROJECT")}</h3>
                        {this.renderProjectManager()}

                        <h3>{gettext("Choose workers")}</h3>

                        <div className="block block-bordered">
                            <div className="block-header">
                                <input type="text" className="form-control search" placeholder={gettext("Search...")} />
                            </div>

                            <table className="table no-margin">
                                <thead>
                                    <tr>
                                        <td>
                                            <label className="css-input css-checkbox  css-checkbox-primary">
                                                <input type="checkbox" className="select-all-btn" /><span> </span>
                                            </label>
                                        </td>
                                        <td>
                                            <label className="css-input css-checkbox  css-checkbox-primary">{gettext("Worker Name")}</label>
                                        </td>
                                        <td>
                                            <label className="css-input css-checkbox  css-checkbox-primary">{gettext("E-mail")}</label>
                                        </td>
                                    </tr>
                                </thead>
                                {this.renderProjectWorkers()}
                            </table>
                        </div>

                        <input type="hidden" name="update_users" value="1"/>
                        <input type="hidden" className="company-status-input" name="company_status"/>
                        <div className="messages" style={{marginTop: '10px', marginBottom: '10px'}}></div>
                        <button type="submit" className="btn btn-primary next-btn submit-btn" >{gettext("Save")}</button>
                        &nbsp;
                        {project.id && project.company_id == user.company.id && isCompanyManager ? <button type="button" onClick={this.onDeleteProjectButton.bind(this)} className="btn btn-danger delete-btn">{gettext("Delete")}</button> : null}
                        &nbsp;
                        {project.id && isCompanyManager && isActiveProject ? <button type="button" onClick={this.onArchiveProjectButton.bind(this)} className="btn btn-info archive-project-btn">{gettext("Archive project")}</button> : null}
                        &nbsp;
                        <button type="button" onClick={this.onCancelButton.bind(this)} className="btn btn-default" >{gettext("Cancel")}</button>
                        <br/><br/>
                    </form>
                </div>
                <div id="pickadatecontainer"></div>
                <div id="dtBox"></div>
            </div>
        )
    }
}

ProjectCRUDForm.propTypes = {
    project: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
    const {environment, auth} = state;
    return {
        environment,
        user: auth.user,
    };
}

export default connect(mapStateToProps)(ProjectCRUDForm)