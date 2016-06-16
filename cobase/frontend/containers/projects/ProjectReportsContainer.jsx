import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {changeTitle, toggleBackButton} from 'actions/site.es6'
import Loading from 'components/Loading.jsx'
import ProjectReportsManager from 'components/projects/ProjectReportsManager.jsx'
import ProjectReportsWorker from 'components/projects/ProjectReportsWorker.jsx'
import * as config from 'constants/Config.es6';
import {fetchUserIfNeed} from 'actions/auth.es6'
import {isMobile} from 'utils/environment.es6'
import {resetActiveProjectTasksSets, getActiveProject, initActiveProject} from 'actions/projects.es6'


class ProjectReportsContainer extends Component {
    componentDidMount() {
        const {dispatch, activeProjectGuid} = this.props;
        dispatch(initActiveProject(activeProjectGuid, (project) => {
            dispatch(changeTitle(project.title))
        }))
        dispatch(fetchUserIfNeed(config.AUTH_USER_BASE_FIELDS.concat(['companyusers'])))
        dispatch(toggleBackButton(false))
        dispatch(resetActiveProjectTasksSets(['alerts', 'overviewTasks', 'overviewAlerts', 'tasksInbox', 'tasksOutbox', 'tasksDone']))
    }

    renderContent(){
        const {dispatch, user, project} = this.props;

        var projectUserRole = project.getUserRole(user.id)
        if(projectUserRole == 'worker'){
            return <ProjectReportsWorker project={project} />
        }else{
            return <ProjectReportsManager project={project} />
        }
    }

    render() {
        const {dispatch, user, height, project} = this.props;

        if(!user['companyusers'] || !project){
            return <Loading />
        }

        return (
            <div className={`pagecontent pagecontent-hidden project-reports`} style={{height: `${height}px`}}>
                {this.renderContent()}
                <div className="clear"></div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {environment, auth, projects} = state;

    return {
        environment,
        user: auth.user,
        activeProjectGuid: props.params['guid'],
        height: environment.pageContentHeight,
        project: getActiveProject(projects, props.params['guid']),
    }
}

export default connect(mapStateToProps)(ProjectReportsContainer);