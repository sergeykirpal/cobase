import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {changeTitle, toggleBackButton} from 'actions/site.es6'
import {getActiveProject, initActiveProject} from 'actions/projects.es6'
import Loading from 'components/Loading.jsx'
import * as config from 'constants/Config.es6';
import {fetchUserIfNeed} from 'actions/auth.es6'
import ProjectAccessForm from 'components/projects/ProjectAccessForm.jsx'
import ProjectAccessLimitationCounter from 'components/projects/ProjectAccessLimitationCounter.jsx'
import TopContent from 'components/TopContent.jsx'
import LimitationMessage from 'components/LimitationMessage.jsx'
import {isMobile} from 'utils/environment.es6'


class ProjectAccessContainer extends Component {
    componentDidMount() {
        const {dispatch, activeProjectGuid} = this.props;
        dispatch(initActiveProject(activeProjectGuid, function (project) {
            dispatch(changeTitle(project.title))
        }))
        dispatch(toggleBackButton(isMobile('any')))
        dispatch(fetchUserIfNeed(config.AUTH_USER_BASE_FIELDS.concat(['projectsaccess'])))
    }

    render() {
        const {dispatch, user, height, project} = this.props;

        if(!user['projectsaccess'] || !project){
            return <Loading />
        }
        
        return (
            <div className={`pagecontent pagecontent-white setScrollBar`} style={{height: `${height}px`}}>
                <TopContent>
                    <LimitationMessage allowedTypes={['projectsaccess']}/>
                </TopContent>
                <ProjectAccessLimitationCounter />
                <ProjectAccessForm project={project} access={project.access} />
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
        project: getActiveProject(projects)
    }

    return data;
}

export default connect(mapStateToProps)(ProjectAccessContainer);