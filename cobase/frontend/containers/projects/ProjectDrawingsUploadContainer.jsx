import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {changeTitle, toggleBackButton} from 'actions/site.es6'
import {getActiveProject, initActiveProject, fetchActiveProjectFoldersIfNeed} from 'actions/projects.es6'
import Loading from 'components/Loading.jsx'
import * as config from 'constants/Config.es6';
import {fetchUserIfNeed} from 'actions/auth.es6'
import ProjectDrawingsUploadLimitationCounter from 'components/projects/ProjectDrawingsUploadLimitationCounter.jsx'
import ProjectDrawingsUploadForm from 'components/projects/ProjectDrawingsUploadForm.jsx'
import TopContent from 'components/TopContent.jsx'
import LimitationMessage from 'components/LimitationMessage.jsx'
import {isMobile} from 'utils/environment.es6'


class ProjectDrawingsUploadContainer extends Component {
    componentDidMount() {
        const {dispatch, activeProjectGuid} = this.props;
        dispatch(initActiveProject(activeProjectGuid, function (project) {
            dispatch(changeTitle(project.title))
        }))
        dispatch(toggleBackButton(isMobile('any')))
        dispatch(fetchUserIfNeed(config.AUTH_USER_BASE_FIELDS.concat(['projectsimages'])))
    }

    componentWillUnmount(){
        const {dispatch, project} = this.props;
        dispatch(fetchActiveProjectFoldersIfNeed(true))
    }

    render() {
        const {dispatch, user, height, project} = this.props;

        if(!user['projectsimages'] || !project){
            return <Loading />
        }
        
        return (
            <div className={`pagecontent pagecontent-white setScrollBar`} style={{height: `${height}px`}}>
                <TopContent>
                    <LimitationMessage allowedTypes={['projectsimages']}/>
                </TopContent>
                <ProjectDrawingsUploadLimitationCounter />
                <ProjectDrawingsUploadForm project={project} />
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

export default connect(mapStateToProps)(ProjectDrawingsUploadContainer);