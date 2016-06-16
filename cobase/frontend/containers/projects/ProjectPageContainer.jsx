import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {changeTitle, toggleBackButton} from 'actions/site.es6'
import {fetchActiveProjectIfNeed, getActiveProject, initActiveProject, activeProjectUpdated} from 'actions/projects.es6'
import Loading from 'components/Loading.jsx'
import * as config from 'constants/Config.es6';
import {fetchUserIfNeed} from 'actions/auth.es6'
import ProjectContainer from 'containers/projects/ProjectContainer.jsx'
import {isMobile} from 'utils/environment.es6'


class ProjectPageContainer extends ProjectContainer {
    componentDidMount() {
        const {dispatch, activeProjectGuid} = this.props;
        if(activeProjectGuid){
            dispatch(fetchActiveProjectIfNeed(activeProjectGuid, function (project) {
                dispatch(changeTitle(project.title))
            }))
        }
        dispatch(toggleBackButton(isMobile('any')))
        dispatch(fetchUserIfNeed(config.AUTH_USER_BASE_FIELDS.concat(['companyusers']), () => {
            if(!activeProjectGuid){
                dispatch(changeTitle(gettext('New Project')))
                dispatch(activeProjectUpdated(this.getNewProject(), true))
            }
        }))
    }

    render() {
        const {dispatch, user, height, project} = this.props;

        if(!user['companyusers'] || !project){
            return <Loading />
        }

        return (
            <div className={`pagecontent setScrollBar`} style={{height: `${height}px`}}>
                {this.renderContent()}
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {environment, auth, projects} = state;

    var data = {
        environment,
        user: auth.user,
        activeProjectGuid: props.params['guid'],
        height: environment.pageContentHeight,
        project: getActiveProject(projects, props.params['guid'])
    }

    return data;
}

export default connect(mapStateToProps)(ProjectPageContainer);