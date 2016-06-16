import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {ProjectImageUploadManager} from 'classes/projects/drawing.es6'
import {resetActiveProject, fetchActiveProjectIfNeed} from 'actions/projects.es6'
import * as config from 'constants/Config.es6';


class ProjectDrawingsUploadForm extends Component {
    componentDidMount(){
        this.initManager()
    }

    componentWillUnmount(){
        this.removeManager()
    }

    initManager(){
        const {dispatch, user, access, project} = this.props;

        window.projectDrawingsUploadMngr = new ProjectImageUploadManager({
            box: '.project-drawings-upload-form',
            project: project,
            user: user,
            uploadconf: config.PROJECTS_PROJECT_DRAWING_UPLOAD_LIMITATIONS
        })

        socketManager.addEventSuscriber('projectDrawingsUploadMngr', projectDrawingsUploadMngr)
        projectDrawingsUploadMngr.run()
    }

    removeManager(){
        if(window.projectDrawingsUploadMngr){
            socketManager.removeEventSuscriber('projectDrawingsUploadMngr')
            delete window.projectDrawingsUploadMngr
        }
    }

    onCancelButton(){
        appHistory.goBack()
    }

    render(){
        const {dispatch, user, height, project} = this.props;

        return (
            <div className="block no-margin project-drawings-upload-form">
                <div className="block-header bg-gray-lighter">        
                    <h3 className=" text-center">{gettext("DRAWINGS MANAGER")}</h3>
                </div>
                <div className="block-header">        
                    <h3 className="block-title">{gettext("ADD NEW FOLDER")}</h3>
                </div>
                <div className="block-content">              
                    <div className="create-folder">
                        <form method="post">                    
                            <div className="form-group folder-status">                                                                                                                                  
                                    <label onclick="$('.private-text').show();$('.public-text').hide();" className="css-input css-radio css-radio-danger push-10-r pointer">
                                        <input className="change-task-type-btn" type="radio" name="access" value="private" defaultChecked={true} /><span> </span> <span className="label label-danger labelstyle labelstylewidth">{gettext("PRIVATE")}</span>
                                    </label>
                                                                                          
                                    <label onclick="$('.private-text').hide();$('.public-text').show();" className="css-input css-radio css-radio-primary push-10-r pointer">
                                        <input className="change-task-type-btn" type="radio" name="access" value="public" /><span> </span> <span className="label label-primary labelstyle labelstylewidth">{gettext("GLOBAL")}</span>
                                    </label>  
                                    
                                    <br />
                                    <i className="folder-status-helptext-css private-text fadeIn">
                                        {gettext("Private folder will be shared with your company members only")}
                                    </i>
                                    <i className="folder-status-helptext-css public-text fadeIn" style={{display: 'none'}}>
                                        {gettext("Global folder will be shared with everyone who in working on this project")}
                                    </i>  
                                                                                                                                                                                        
                            </div>                            
                            <div className="form-group">
                                <div className="create-folder input-group">
                                    <input className="form-control id_title" type="text" name="title" placeholder={gettext("Folder Name")} data-error={gettext("Field value may not be blank.")} required={true} />
                                    <span className="input-group-btn">
                                        <button className="btn btn-success add-folder-btn" type="submit">
                                            <i className="glyphicon glyphicon-plus"> </i>&nbsp;{gettext("Add Folder")}
                                        </button>
                                    </span>
                                </div>
                                <div className="help-block with-errors"></div>
                            </div>                                        
                        </form>
                    </div>
                          
                    <table className="js-table-sections table folders">
                        <thead>
                            <tr>
                                <th style={{width: '5%'}}> </th>
                                <th className="nameWidth">{gettext("Name")}</th>                        
                                <th className="text-right">{gettext("ACTION")}</th>
                            </tr>                   
                        </thead>                                                                                           
                    </table> 
                    
                    <div className="form-group">
                        <button type="button" onClick={this.onCancelButton.bind(this)} className="btn btn-success save-upload-data-btn">{gettext("Save")}</button>
                        &nbsp;
                        <button onClick={this.onCancelButton.bind(this)} type="button" className="btn btn-default" >{gettext("Cancel")}</button>
                    </div>           
                </div>
            </div>
        )
    }
}

ProjectDrawingsUploadForm.propTypes = {
    project: PropTypes.object.isRequired,
}

function mapStateToProps(state, props) {
    const {environment, auth} = state;
    return {
        environment,
        user: auth.user
    };
}

export default connect(mapStateToProps)(ProjectDrawingsUploadForm);
