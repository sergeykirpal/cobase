import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {resetActiveProjectTasksSets, getActiveProject, getActiveProjectImage, initActiveProject, fetchActiveProjectTasksSetIfNeed} from 'actions/projects.es6'
import {fetchUserIfNeed} from 'actions/auth.es6'
import * as config from 'constants/Config.es6';
import Loading from 'components/Loading.jsx'
import ProjectDrawing from 'components/projects/ProjectDrawing.jsx'
import {changeTitle, toggleBackButton} from 'actions/site.es6'
import {isMobile} from 'utils/environment.es6'
import ProjectNoDrawing from 'components/projects/ProjectNoDrawing.jsx'


class ProjectDrawingContainer extends Component {
    componentDidMount() {
        const {dispatch, user, projects, activeProjectGuid, image} = this.props;
        dispatch(initActiveProject(activeProjectGuid, function (project) {
            dispatch(changeTitle(project.title))
            if(image){
                dispatch(fetchActiveProjectTasksSetIfNeed(`image${image.id}Tasks`, {image_id: image.id, page_size: '10000000'}))
            }
        }))
        dispatch(toggleBackButton(false))
        dispatch(fetchUserIfNeed(config.AUTH_USER_BASE_FIELDS))
        dispatch(resetActiveProjectTasksSets(['alerts', 'overviewTasks', 'overviewAlerts', 'tasksInbox', 'tasksOutbox', 'tasksDone']))
    }

    componentWillReceiveProps(nextProps){
        var {dispatch, image} = nextProps

        if((!this.props.image && image) || (this.props.image && image && this.props.image.id != image.id)){
            dispatch(fetchActiveProjectTasksSetIfNeed(`image${image.id}Tasks`, {image_id: image.id, page_size: '10000000'}))
        }
    }

    render() {
        const {dispatch, user, image, project, projects, pageContentHeight} = this.props;

        if(!user.id || !project || !image || !image.active){
            return <Loading />
        }

        var imageId = image.id
        var tasksSetName = `image${imageId}Tasks`
        var tasksSet = projects.activeProject.tasksSets[tasksSetName]
        var selectedTask = projects.activeProject.activeImageTask
        var items = tasksSet ? tasksSet.items : []
        var tasks = projects.activeProject.tasks
        var isUpdating = projects.activeProject.activeImageUpdating

        return (
            <div className="project-drawings pagecontent pagecontent-white setScrollBar" style={{height: `${pageContentHeight}px`}}>
                <ProjectDrawing key={`project-image-${imageId}`} project={project} image={image} items={items} tasks={tasks} selectedTask={selectedTask} isUpdating={isUpdating} />
                <div className="clear"></div>
            </div>
        );
    }
}

function mapStateToProps(state, props) {
    const {environment, auth, projects} = state;
    var imageGuid = props.params['imageGuid']
    var image = getActiveProjectImage(imageGuid, projects)

    return {
        environment,
        auth,
        user: auth.user,
        projects,
        activeProjectGuid: props.params['guid'],
        image,
        pageContentHeight: environment.pageContentHeight,
        project: getActiveProject(projects, props.params['guid'])
    };
}

export default connect(mapStateToProps)(ProjectDrawingContainer);
