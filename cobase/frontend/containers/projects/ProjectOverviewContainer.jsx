import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import * as config from 'constants/Config.es6';
import {resetActiveProjectTasksSets, handleActiveProjectTasksSetSeenItems, activateActiveProjectTasksSet, getActiveProject, fetchActiveProjectIfNeed, initActiveProject} from 'actions/projects.es6'
import Loading from 'components/Loading.jsx'
import ProjectOverviewList from 'components/projects/ProjectOverviewList.jsx'
import TopContent from 'components/TopContent.jsx'
import {ProjectsUrls} from 'constants/Urls.es6'
import {isMobile} from 'utils/environment.es6'
import ProjectsTasksCounter from 'components/projects/ProjectsTasksCounter.jsx'
import ProjectTasksBaseContainer from 'containers/projects/ProjectTasksBaseContainer.jsx'
import {toggleBackButton} from 'actions/site.es6'
import {changeTitle} from 'actions/site.es6'
import {fetchUserIfNeed} from 'actions/auth.es6'


class ProjectOverviewContainer extends ProjectTasksBaseContainer {
    componentDidMount() {
        const {dispatch, activeProjectGuid, tasksSets, setName, setNames, setData} = this.props;
        dispatch(initActiveProject(activeProjectGuid, (project) => {
            dispatch(changeTitle(project.title))
            dispatch(fetchUserIfNeed(config.AUTH_USER_BASE_FIELDS, (user) => {
                var setNameDefault = 'overviewTasks'
                if(!setName || setNames.indexOf(setName) == -1 || (setData && setData.items == null)){
                    this.onTabButon(setNameDefault)
                }else{
                    this.onTabButon(setName)
                }
            }))
        }))
        dispatch(toggleBackButton(false))
        dispatch(resetActiveProjectTasksSets(['alerts', 'tasksInbox', 'tasksOutbox', 'tasksDone']))
    }

    renderLists(){
        const {tasks, environment, project, overviewTasks, overviewAlerts, filterVisible, height} = this.props

        return (
            <div>
                {filterVisible ? <div className="cobase-block-content-in-block margintfromtop"></div> : null}
                <ProjectOverviewList checkSeenItems={false} height={height} setName="overviewTasks" setData={overviewTasks} project={project} tasks={tasks} />
                <ProjectOverviewList checkSeenItems={false} height={height} setName="overviewAlerts" setData={overviewAlerts} project={project} tasks={tasks} />
            </div>
        )
    }

    renderTabs(){
        const {dispatch, user, environment, project} = this.props;
        var items = []
        items.push(
            <li key="tab-overviewTasks" className={`pointer ${this.tabActiveClass('overviewTasks')}`} ><a className={`tab tab-overviewTasks`} onClick={this.onTabButon.bind(this, 'overviewTasks')}>{gettext("TASKS")}</a></li>,
            <li key="tab-overviewAlerts" className={`pointer ${this.tabActiveClass('overviewAlerts')}`} ><a className={`tab tab-overviewAlerts`} onClick={this.onTabButon.bind(this, 'overviewAlerts')}>{gettext("ALERTS")}</a></li>
        )
        return <ul className="nav nav-tabs nav-tabs-alt">{items}</ul>
    }
}


function mapStateToProps(state, props) {
    const {environment, auth, projects} = state;
    var project = getActiveProject(projects, props.params['guid'])
    var user = auth.user
    var tasks = projects.activeProject ? projects.activeProject.tasks : {}
    var tasksSets = projects.activeProject && projects.activeProject.tasksSets ? projects.activeProject.tasksSets : {}
    var setNames = ['overviewTasks', 'overviewAlerts']

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

export default connect(mapStateToProps)(ProjectOverviewContainer);
