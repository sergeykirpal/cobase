import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import * as config from 'constants/Config.es6';
import {fetchUserIfNeed} from 'actions/auth.es6'
import {handleActiveProjectTasksSetSeenItems, activateActiveProjectTasksSet, getActiveProject, fetchActiveProjectIfNeed, initActiveProject, fetchActiveProjectTasksSetIfNeed} from 'actions/projects.es6'
import Loading from 'components/Loading.jsx'
import ProjectTasksList from 'components/projects/ProjectTasksList.jsx'
import TopContent from 'components/TopContent.jsx'
import {ProjectsUrls} from 'constants/Urls.es6'
import {activeClass} from 'utils/url.es6'
import {isMobile} from 'utils/environment.es6'
import ProjectTaskListFilter from 'components/projects/ProjectTaskListFilter.jsx'


export default class ProjectTasksBaseContainer extends Component {
    startHandleSeenTasksAsRead(){
        const {dispatch} = this.props;

        window.handleSeenTasksInterval = setInterval(function() {
            dispatch(handleActiveProjectTasksSetSeenItems())
        }, 10000)
    }

    stopHandleSeenTasksAsRead(){
        if(window.handleSeenTasksInterval){
            clearInterval(window.handleSeenTasksInterval)
        }
    }

    onTabButon(setName){
        const {tasksSets, dispatch} = this.props

        if(!tasksSets[setName]){
            dispatch(fetchActiveProjectTasksSetIfNeed(setName, null, () => dispatch(activateActiveProjectTasksSet(setName))))
        }else{
            dispatch(activateActiveProjectTasksSet(setName))
        }
    }
    
    tabActiveClass(name){
        var setName = this.props['setName']
        if(setName && setName == name){
            return 'active'
        }
        return ''
    }

    renderFilter(){
        const {dispatch, user, environment, project, setData, setName, filterVisible, height} = this.props;

        if(setData){
            return <ProjectTaskListFilter height={isMobile('any') ? height : 300} visible={filterVisible} setName={setName} params={setData.filterParams} project={project} />
        }
    }

    render() {
        const {dispatch, user, environment, project} = this.props;

        if(!user.id || !project){
            return <Loading />
        }

        return (
            <div className={`pagecontent fadeIn`} style={{height: `${environment.pageContentHeight}px`}}>
                <TopContent className="block"> {this.renderTabs()}</TopContent>
                {this.renderFilter()}
                {this.renderLists()}
                <div className="clear"></div>
            </div>
        );
    }
}