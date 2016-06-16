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


class ProjectTasksContainer extends ProjectTasksBaseContainer {
    componentDidMount() {
        const {dispatch, activeProjectGuid, tasksSets, setName, setData, setNames} = this.props;
        dispatch(initActiveProject(activeProjectGuid, (project) => {
            dispatch(changeTitle(project.title))
            dispatch(fetchUserIfNeed(config.AUTH_USER_BASE_FIELDS, (user) => {
                this.startHandleSeenTasksAsRead()
                var setNameDefault = project.checkUserRole(user.id, 'worker') ? 'tasksInbox' : 'tasksOutbox'
                if(!setName || setNames.indexOf(setName) == -1 || (setData && setData.items == null)){
                    this.onTabButon(setNameDefault)
                }else{
                    this.onTabButon(setName)
                }
            }))
        }))
        dispatch(toggleBackButton(false))
        dispatch(resetActiveProjectTasksSets(['alerts', 'overviewTasks', 'overviewAlerts']))
    }

    componentWillUnmount(){
        this.stopHandleSeenTasksAsRead()
    }

    renderLists(){
        const {tasks, environment, project, tasksInbox, tasksOutbox, tasksDone, filterVisible, height} = this.props

        return (
            <div>
                {filterVisible ? <div className="cobase-block-content-in-block margintfromtop"></div> : null}
                <ProjectTasksList checkSeenItems={false} height={height} setName="tasksInbox" setData={tasksInbox} project={project} tasks={tasks} />
                <ProjectTasksList checkSeenItems={true} height={height} setName="tasksOutbox" setData={tasksOutbox} project={project} tasks={tasks} />
                <ProjectTasksList checkSeenItems={true} height={height} setName="tasksDone" setData={tasksDone} project={project} tasks={tasks} />
            </div>
        )
    }

    renderTabs(){
        const {dispatch, user, environment, project} = this.props;
        var projectUserRole = project.getUserRole(user.id)
        var items = []
        items.push(
            <li key="tab-tasksOutbox" className={`pointer ${this.tabActiveClass('tasksOutbox')}`} ><ProjectsTasksCounter code="sent" project={project} /><a className={`tab tab-tasksOutbox`} onClick={this.onTabButon.bind(this, 'tasksOutbox')}>{gettext("SENT")}</a></li>,
            <li key="tab-tasksInbox" className={`pointer ${this.tabActiveClass('tasksInbox')}`} ><ProjectsTasksCounter code="foruser" project={project} /><a className={`tab tab-tasksInbox`} onClick={this.onTabButon.bind(this, 'tasksInbox')}>{gettext("MY TASKS")}</a></li>
        )
        if(projectUserRole == 'worker'){
            items.reverse()
        }
        items.push(<li key="tab-tasksDone" className={`pointer ${this.tabActiveClass('tasksDone')}`} ><ProjectsTasksCounter code="done" project={project} /><a className={`tab tab-tasksDone`} onClick={this.onTabButon.bind(this, 'tasksDone')}>{gettext("DONE")}</a></li>)
        return <ul className="nav nav-tabs nav-tabs-alt">{items}</ul>
    }
}


function mapStateToProps(state, props) {
    const {environment, auth, projects} = state;
    var project = getActiveProject(projects, props.params['guid'])
    var user = auth.user
    var tasks = projects.activeProject ? projects.activeProject.tasks : {}
    var tasksSets = projects.activeProject && projects.activeProject.tasksSets ? projects.activeProject.tasksSets : {}
    var setNames = ['tasksInbox', 'tasksOutbox', 'tasksDone']

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
        setNames: setNames
    };
    if(project){
        for(let setName of setNames){
            let setData = tasksSets[setName]
            data[setName] = setData
            if(setData && setData.isActive){
                data['setData'] = setData
                data['setName'] = setName
            }
        }
    }

    return data;
}

export default connect(mapStateToProps)(ProjectTasksContainer);
