import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {fetchUserIfNeed} from 'actions/auth.es6'
import * as config from 'constants/Config.es6';
import ProjectContainer from 'containers/projects/ProjectContainer.jsx'
import {isMobile} from 'utils/environment.es6'
import {modal} from 'react-redux-modal'
import {getActiveProject, initActiveProject, activeProjectUpdated} from 'actions/projects.es6'


class ProjectModalContainer extends ProjectContainer {
    afterTaskSave(referer, updatedTask){
        const {dispatch, project, afterTaskSave} = this.props;
        this.props.remove()

        if(typeof afterTaskSave == 'function'){
            afterTaskSave(referer, updatedTask)
        }
    }

    componentDidMount() {
        const {dispatch, activeProjectGuid} = this.props;
        if(activeProjectGuid){
            dispatch(initActiveProject(activeProjectGuid, function (project) {
            }))
        }else{
            dispatch(activeProjectUpdated(this.getNewProject(), true))
        }
    }

    render(){
        const {dispatch, height} = this.props;
        return <div className={`pagecontent pagecontent-white`} style={{paddingBottom: '10px', minHeight: `${height}px`}}>
            {this.renderContent()}
            <div className="clear"></div>
        </div>
    }
}

ProjectModalContainer.propTypes = {
    data: PropTypes.object.isRequired,
}

function mapStateToProps(state, props) {
    const {environment, auth, projects} = state;

    return {
        environment,
        user: auth.user,
        afterTaskSave: props.data.afterTaskSave,
        project: getActiveProject(projects),
        pageContentHeight: environment.pageContentHeight,
        height: environment.pageContentHeight - 250
    };
}

export default connect(mapStateToProps)(ProjectModalContainer);
