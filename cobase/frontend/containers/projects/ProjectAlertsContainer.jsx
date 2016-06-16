import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import * as config from 'constants/Config.es6';
import {resetActiveProjectTasksSets, handleActiveProjectTasksSetSeenItems, activateActiveProjectTasksSet, getActiveProject, fetchActiveProjectIfNeed, initActiveProject} from 'actions/projects.es6'
import Loading from 'components/Loading.jsx'
import ProjectTasksList from 'components/projects/ProjectTasksList.jsx'
import TopContent from 'components/TopContent.jsx'
import {ProjectsUrls} from 'constants/Urls.es6'
import {isMobile} from 'utils/environment.es6'
import ProjectsTasksCounter from 'components/projects/ProjectsTasksCounter.jsx'
import ProjectTasksBaseContainer from 'containers/projects/ProjectTasksBaseContainer.jsx'
import {toggleBackButton} from 'actions/site.es6'
import {changeTitle} from 'actions/site.es6'
import {fetchUserIfNeed} from 'actions/auth.es6'

class ProjectAlertsContainer extends ProjectTasksBaseContainer {
    componentDidMount() {
        const {dispatch, activeProjectGuid, tasksSets, setName, setData, setNames} = this.props;
        dispatch(initActiveProject(activeProjectGuid, (project) => {
            dispatch(changeTitle(project.title))
            dispatch(fetchUserIfNeed(config.AUTH_USER_BASE_FIELDS, (user) => {
                this.startHandleSeenTasksAsRead()
                var setNameDefault = 'alerts'
                if(!setName || setNames.indexOf(setName) == -1 || (setData && setData.items == null)){
                    this.onTabButon(setNameDefault)
                }else{
                    this.onTabButon(setName)
                }
            }))
        }))
        dispatch(toggleBackButton(false))
        dispatch(resetActiveProjectTasksSets(['overviewTasks', 'overviewAlerts', 'tasksInbox', 'tasksOutbox', 'tasksDone']))
    }

    componentWillUnmount(){
        this.stopHandleSeenTasksAsRead()
    }

    renderLists(){
        const {tasks, environment, project, setData, filterVisible, height} = this.props

        return (
            <div>
                {filterVisible ? <div className="cobase-block-content-in-block margintfromtop"></div> : null}
                <ProjectTasksList checkSeenItems={true} height={height} setName="alerts" setData={setData} project={project} tasks={tasks} />
            </div>
        )
    }

    renderTabs(){

    }
}

function mapStateToProps(state, props) {
    const {environment, auth, projects} = state;
    var project = getActiveProject(projects, props.params['guid'])
    var user = auth.user
    var tasks = projects.activeProject ? projects.activeProject.tasks : {}
    var tasksSets = projects.activeProject && projects.activeProject.tasksSets ? projects.activeProject.tasksSets : {}
    var setData = tasksSets['alerts']

    var data = {
        environment,
        user: user,
        activeProjectGuid: props.params['guid'],
        tasksSets,
        tasks,
        projects,
        project: project,
        filterVisible: projects.activeProject.tasksFilterVisible,
        height: environment.pageContentHeight - environment.topContentHeight,
        setNames: ['alerts'],
        setName: setData && setData.isActive ? 'alerts' : null,
        setData: setData && setData.isActive ? setData : null
    };

    return data;
}

export default connect(mapStateToProps)(ProjectAlertsContainer);
