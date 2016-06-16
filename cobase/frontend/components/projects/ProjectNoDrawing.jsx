import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {Link} from 'react-router'
import {resetActiveProjectTasksSets, getActiveProject, toggleProjectDrawingRightPanel} from 'actions/projects.es6'
import {ProjectsUrls} from 'constants/Urls.es6'


class ProjectNoDrawing extends Component {
    componentDidMount(){
        const {dispatch} = this.props;
        dispatch(resetActiveProjectTasksSets())
    }

    render() {
        const {dispatch, environment, project, image, user} = this.props;
        var projectUserRole = project.getUserRole(user.id)
        var isProjectActive = project.isActiveForUser(user.id)
        return (
            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                <br/>
                {(()=>{
                    if(image){
                        return(
                           <div className="alert alert-warning alert-dismissable">
                                <div className="message emptyPage message-for-empty-drawing-map" data="1">
                                   <img src="/static/img/loading.gif" className="fileLoadingStatus"/> {gettext('Please wait, we are preparing drawings for you')}
                                </div>
                            </div>
                        )
                    }else{
                        return (
                            <div>
                                <div className="alert alert-warning alert-dismissable">
                                    <div className="message emptyPage message-for-empty-drawing-map" data="1">
                                        {gettext("You haven't upload any drawings yet")}
                                    </div>
                                </div>
                                {isProjectActive && (projectUserRole == 'manager' || projectUserRole == 'director') ? <Link style={{marginTop: '15%'}} className="pointer upload-drawing-cloud" to={ProjectsUrls.project(project.guid, 'upload')}> <center> <span style={{fontSize: '70px'}} className="fa fa-cloud-upload text-dark-gray"> </span> </center> <h5 className="text-center"> {gettext('UPLOAD DRAWINGS')} </h5> </Link> : null}
                            </div>
                        )
                    }
                })()}
            </div>
        )
    }
}

ProjectNoDrawing.propTypes = {
    project: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
    const {environment, auth} = state;
    return {
        environment,
        user: auth.user
    };
}

export default connect(mapStateToProps)(ProjectNoDrawing);
