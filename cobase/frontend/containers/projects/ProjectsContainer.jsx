import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import * as config from 'constants/Config.es6';
import {fetchUserIfNeed} from 'actions/auth.es6'
import {resetActiveProjectTasksSets, fetchProjectsIfNeed} from 'actions/projects.es6'
import {changeTitle} from 'actions/site.es6'
import Loading from 'components/Loading.jsx'
import ProjectsList from 'components/projects/ProjectsList.jsx'
import TopContent from 'components/TopContent.jsx'
import {User} from 'classes/auth.es6'
import {ProjectsUrls} from 'constants/Urls.es6'
import {activeClass} from 'utils/url.es6'
import {isMobile} from 'utils/environment.es6'
import {Link} from 'react-router'
import {toggleBackButton} from 'actions/site.es6'
import LimitationMessage from 'components/LimitationMessage.jsx'
import ProjectActiveLimitationCounter from 'components/projects/ProjectActiveLimitationCounter.jsx'
import {changeLocation} from 'actions/site.es6'


class ProjectsContainer extends Component {
    componentDidMount() {
        const {dispatch, setName, setData} = this.props;
        dispatch(fetchUserIfNeed(config.AUTH_USER_BASE_FIELDS.concat(['projectsactive', 'projectsworking'])))
        dispatch(changeTitle(gettext('Projects')))
        dispatch(toggleBackButton(false))

        if(!setData || !setData.items.length){
            dispatch(fetchProjectsIfNeed(setName))
        }
        dispatch(resetActiveProjectTasksSets(['alerts', 'overviewTasks', 'overviewAlerts', 'tasksInbox', 'tasksOutbox', 'tasksDone']))
    }

    componentWillReceiveProps(nextProps){
        const {dispatch} = this.props;
        if (!nextProps.setData || !nextProps.setData.items.length) {
            dispatch(fetchProjectsIfNeed(nextProps.setName))
        }
    }

    renderList(){
        const {setData, setName, projects, environment} = this.props
        if(setData && environment.height > 0){
            return <ProjectsList setName={setName} setData={setData} projects={projects} />
        }
        return ''
    }

    render() {
        const {dispatch, auth, user, pageContentHeight, projects, setName} = this.props;

        if(!user['projectsactive']){
            return <Loading />
        }

        return (
            <div className={`pagecontent pagecontent-hidden projects-page fadeIn`} style={{height: `${pageContentHeight}px`}}>
                <TopContent>
                    <LimitationMessage allowedTypes={['projectsactive']}/>
                    <div className="projects-page-list-css projects-page-tabs">
                        <div onClick={changeLocation.bind(this, dispatch, ProjectsUrls.projects('active'))} className={`active-css tab ${activeClass(setName, 'active', 'active')}`} >{gettext('Active')} <ProjectActiveLimitationCounter /></div>
                        <div onClick={changeLocation.bind(this, dispatch, ProjectsUrls.projects('archived'))} className={`tab archived-css ${activeClass(setName, 'archived', 'active')}`} >{gettext('Archived')}</div>
                    </div>
                </TopContent>
                {(()=>{
                    if(setName == "archived"){
                        return(
                           <div className="projects-description">
                                <h5 className="line-dashed-css">{gettext("ARCHIVED PROJECTS")}</h5>
                                <div className="more-info">
                                    {gettext("These projects below are read only. In order to work with  those projects you must activate them first")}
                                </div>
                            </div>
                        )
                    }
                })()}
                {this.renderList()}
                <div className="clear"></div>
            </div>
        );
    }
}

function mapStateToProps(state, props) {
    const {environment, auth, projects} = state;
    var setName = props.route.setName
    return {
        environment,
        user: auth.user,
        auth,
        pageContentHeight: environment.pageContentHeight,
        projects: projects.projects,
        setName,
        setData: projects.projectsSets[setName]
    };
}

export default connect(mapStateToProps)(ProjectsContainer);
