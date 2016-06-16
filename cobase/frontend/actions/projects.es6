import * as types from 'constants/ActionTypes.es6';
import * as config from 'constants/Config.es6';
import {arrayOf, normalize} from 'normalizr';
import {projectSchema, projectTaskSchema} from 'constants/Schemas.es6'
import {ProjectsUrls} from 'constants/Urls.es6'
import {queryString, makeQueryString} from 'utils/url.es6'
import {Geolocation} from 'utils/geolocation.es6'
import {PUTRequest, POSTRequest, GETRequest, DELETERequest} from 'utils/api.es6'
import {Project, ProjectTask} from 'classes/projects/common.es6'
import messages from 'messages/projects.es6'
var moment = require('moment');


export function projectUpdated(project, force=false) {
    return function (dispatch, getState){
        var {projects, auth} = getState()
        var user = auth.user
        var isProjectActive = project.isActiveForUser(user.id)
        var validSets = isProjectActive ? 'active' : 'archived'
        var entities = projects.projects

        if(!force && !entities[project.guid]){
            return
        }

        for(let setName of Object.keys(projects.projectsSets)){
            if(validSets.indexOf(setName) == -1){
                dispatch({
                    type: types.PROJECTS_PROJECT_DELETED,
                    project,
                    setName
                })
            }else{
                dispatch({
                    type: types.PROJECTS_PROJECT_UPDATED,
                    project,
                    setName
                })
            }
        }

    }
}

export function projectCreated(project) {
    return function (dispatch, getState){
        var {projects, auth} = getState()
        var user = auth.user
        if(project.getUser(user.id)){
            dispatch(projectUpdated(project, true))
        }
    }
}

export function projectDeleted(project) {
    return function (dispatch, getState){
        var {projects, auth} = getState()
        var entities = projects.projects

        if(!entities[project.guid]){
            return
        }

        for(let setName of Object.keys(projects.projectsSets)){
            dispatch({
                type: types.PROJECTS_PROJECT_DELETED,
                project,
                setName
            })
        }
    }
}

export function fetchProjectsIfNeed(setName){
    return (dispatch, getState) => {
        const {projects} = getState();
        var projectsSets = projects.projectsSets;
        var activeSet = projectsSets[setName];
        var nextUrl = null

        if(!activeSet){
            nextUrl = ProjectsUrls.api.projects+`?status=${setName}`
        } else if (!activeSet.isFetching && activeSet.nextUrl) {
            nextUrl = activeSet.nextUrl
        }
        if (nextUrl) {
            return dispatch(fetchProjects(nextUrl, setName));
        }
    }
}

export function fetchProjects(url, setName){
    return (dispatch, getState) => {
        dispatch(fetchProjectsRequest(setName, url))
        return GETRequest(url, null, function(response){
            const normalized = normalize(response.data, arrayOf(projectSchema));
            var projects = {}
            var project
            if(normalized.entities.projects){
                for(let projectGuid of Object.keys(normalized.entities.projects)){
                    project = normalized.entities.projects[projectGuid]
                    projects[projectGuid] = new Project(project)
                }
            }

            dispatch(fetchProjectsResponse(setName, projects, normalized.result, response.keys.next_url))
        })
    }
}

export function fetchProjectsRequest(setName, nextUrl) {
    return {
        type: types.PROJECTS_PROJECTS_REQUEST,
        setName,
        nextUrl
    }
}

export function fetchProjectsResponse(setName, projects, items, nextUrl) {
    return {
        type: types.PROJECTS_PROJECTS_RESPONSE,
        setName,
        projects,
        items,
        nextUrl
    }
}

export function fetchActiveProjectIfNeed(guid, callback=null){
    return (dispatch, getState) => {
        const {projects} = getState();
        var activeProject = projects.activeProject;
        var url

        if(!activeProject.isFetching){
            url = `${ProjectsUrls.api.projects}?page=1&page_size=1&guid=${guid}&fields=${config.PROJECTS_ACTIVE_PROJECT_FIELDS}`
        }

        if (url) {
            return dispatch(fetchActiveProject(url, guid, callback));
        }
    }
}

export function fetchActiveProject(url, guid, callback=null){
    return (dispatch, getState) => {
        dispatch(fetchActiveProjectRequest(url, guid))
        return GETRequest(url, null, function(response){
            var project = new Project(response.data[0])
            dispatch(fetchActiveProjectResponse(project))
            if(typeof callback == 'function'){
                callback(project)
            }
        })
    }
}

export function fetchActiveProjectRequest(url, guid) {
    return {
        type: types.PROJECTS_ACTIVE_PROJECT_REQUEST,
        url,
        guid
    }
}

export function fetchActiveProjectResponse(project) {
    return {
        type: types.PROJECTS_ACTIVE_PROJECT_RESPONSE,
        project
    }
}

export function activeProjectUpdated(project, force=false) {
    return function (dispatch, getState){
        var {projects} = getState()
        var activeProject = getActiveProject(projects)
        if(force || (activeProject && activeProject.guid == project.guid)){
            dispatch({
                type: types.PROJECTS_ACTIVE_PROJECT_UPDATED,
                project
            })
            dispatch(projectUpdated(project))
        }
    }
}

export function resetActiveProjectTasksSet(setName) {
    return {
        type: types.PROJECTS_ACTIVE_PROJECT_TASKS_SET_RESET,
        setName
    }
}

export function resetActiveProjectTasksSets(setNames) {
    return (dispatch, getState) => {
        var {projects} = getState()
        var tasksSets  = projects.activeProject.tasksSets  ? projects.activeProject.tasksSets : {}
        for(let setName of Object.keys(tasksSets)){
            if(setNames && setNames.indexOf(setName) != -1){
                dispatch(resetActiveProjectTasksSet(setName))
            }
        }
    }
}

export function fetchActiveProjectTasksSetIfNeed(setName, setParams=null, callback=null) {
    return (dispatch, getState) => {
        const {projects} = getState()
        var tasksSets  = projects.activeProject.tasksSets
        var tasksSet  = tasksSets[setName]
        var activeProject = getActiveProject(projects)

        if(activeProject && (!tasksSet || !tasksSet.isFetching)){
            if(!tasksSet || (tasksSet.items === null && tasksSet.nextUrl === null)){
                if(!tasksSet){
                    dispatch(createActiveProjectTasksSet(setName))
                }
                dispatch((dispatch, getState) => {
                    const {projects} = getState()
                    tasksSets  = projects.activeProject.tasksSets
                    tasksSet  = tasksSets[setName]
                    var params = tasksSet.filterParams
                    if(setParams){
                        params = Object.assign({}, params, setParams)
                    }
                    var url = `${ProjectsUrls.api.projectTasks(activeProject.id)}${queryString(params)}`
                    dispatch(fetchActiveProjectTasks(url, setName, callback))
                })
            } else if (tasksSet.nextUrl){
                dispatch(fetchActiveProjectTasks(tasksSet.nextUrl, setName, callback))
            }
        }
    }
}

export function createActiveProjectTasksSet(setName){
    return {
        type: types.PROJECTS_ACTIVE_PROJECT_TASKS_SET_CREATED,
        setName,
    }
}

export function fetchActiveProjectTasks(url, setName, callback=null){
    return (dispatch, getState) => {
        const {projects, auth} = getState()

        var tasksSets = projects.activeProject.tasksSets
        var tasksSet = tasksSets[setName]
        var view = tasksSet.filterParams['view']

        dispatch(fetchActiveProjectTasksRequest(setName, url))
        return GETRequest(url, null, function(response){
            const normalized = normalize(response.data, arrayOf(projectTaskSchema));
            var tasks = {}
            var task
            var items
            if(normalized.entities.tasks){
                for(let taskGuid of Object.keys(normalized.entities.tasks)){
                    task = normalized.entities.tasks[taskGuid]
                    tasks[taskGuid] = new ProjectTask(task)
                }
            }

            if(view != 'byuser'){
                items = normalized.result
                dispatch(fetchActiveProjectTasksResponse(setName, tasks, items, response.keys.next_url))
            }else{
                let targetUsers = {}
                if(response.data.length){
                    for(let taskItem of response.data){
                        if(!targetUsers[taskItem.target_user_id])targetUsers[taskItem.target_user_id] = []
                        targetUsers[taskItem.target_user_id].push(taskItem.guid)
                    }
                    for(let targetUserId of Object.keys(targetUsers)){
                        items = targetUsers[targetUserId]
                        dispatch(fetchActiveProjectTasksResponse(setName, tasks, items, response.keys.next_url, targetUserId))
                    }
                }else{
                    dispatch(fetchActiveProjectTasksResponse(setName, tasks, [], response.keys.next_url, user.id))
                }
            }

            if(typeof callback == 'function'){
                callback()
            }
        })
    }
}

export function fetchActiveProjectTasksRequest(setName, nextUrl){
    return {
        type: types.PROJECTS_ACTIVE_PROJECT_TASKS_REQUEST,
        setName,
        nextUrl
    }
}

export function fetchActiveProjectTasksResponse(setName, tasks, items, nextUrl, userId=null){
    return {
            type: types.PROJECTS_ACTIVE_PROJECT_TASKS_RESPONSE,
            setName,
            tasks,
            items,
            nextUrl,
            userId
        }
}

export function fetchActiveProjectTaskDetailsIfNeed(taskGuid, force=false, callback=null) {
    return (dispatch, getState) => {
        const {projects} = getState()
        var project = getActiveProject(projects)
        var task  = projects.activeProject.taskDetails.task
        var isFetching  = projects.activeProject.taskDetails.isFetching
        var url = null

        if(force || (!task || task.guid != taskGuid) && !isFetching){
            url = `${ProjectsUrls.api.projectTasks(project.id)}?type=details&guid=${taskGuid}`
        }else if(typeof callback == 'function'){
            callback(task)
        }

        if(url){
            dispatch(fetchActiveProjectTaskDetails(url, callback))
        }
    }
}

export function fetchActiveProjectTaskDetails(url, callback=null){
    return (dispatch, getState) => {
        dispatch(fetchActiveProjectTaskDetailsRequest(url))
        return GETRequest(url, null, function(response){
            var task = new ProjectTask(response.data[0])
            dispatch(activeProjectTaskUpdated(task, true))
            dispatch(fetchActiveProjectTaskDetailsResponse(task))
            if(typeof callback == 'function'){
                callback(task)
            }
        })
    }
}

export function fetchActiveProjectTaskDetailsRequest(url) {
    return {
        type: types.PROJECTS_ACTIVE_PROJECT_TASK_DETAILS_REQUEST,
        url
    }
}

export function fetchActiveProjectTaskDetailsResponse(task) {
    return {
        type: types.PROJECTS_ACTIVE_PROJECT_TASK_DETAILS_RESPONSE,
        task
    }
}

export function fetchActiveProjectFoldersIfNeed(force=false) {
    return (dispatch, getState) => {
        const {projects} = getState()
        var project  = getActiveProject(projects)
        if(project){
            var url = null
            if(force || (!projects.activeProject.folders.length && !projects.activeProject.isFoldersFetching)){
                url = `${ProjectsUrls.api.projectFolders(project.id)}?type=ready_images&fields=&file_fields=map`
            }
            if(url){
                dispatch(fetchActiveProjectFolders(url))
            }
        }
    }
}

export function fetchActiveProjectFolders(url) {
    return (dispatch, getState) => {
        dispatch(fetchActiveProjectFoldersRequest(url))
        return GETRequest(url, null, function(folders){
            dispatch(fetchActiveProjectFoldersResponse(folders))
        })
    }
}

export function fetchActiveProjectFoldersRequest(url) {
    return {
        type: types.PROJECTS_ACTIVE_PROJECT_FOLDERS_REQUEST,
        url,
    }
}

export function fetchActiveProjectFoldersResponse(folders) {
    return {
        type: types.PROJECTS_ACTIVE_PROJECT_FOLDERS_RESPONSE,
        folders
    }
}

export function initActiveProject(guid, callback=null) {
    return function (dispatch, getState){
        const {projects} = getState();

        var activeProject = projects.activeProject ? projects.activeProject.project : null
        if(!activeProject || activeProject.guid != guid){
            dispatch(fetchActiveProjectIfNeed(guid, function(project){
                if(typeof callback == 'function'){
                    dispatch(fetchActiveProjectFoldersIfNeed(true))
                    callback(project)
                }
            }))
        }else{
            if(typeof callback == 'function'){
                callback(activeProject)
            }
        }
    }
}

export function resetActiveProject() {
    return {
        type: types.PROJECTS_ACTIVE_PROJECT_RESET
    }
}

export function getActiveProjectImage(imageGuid, projects){
    var project = getActiveProject(projects)
    var folders = projects.activeProject.folders
    if(project){
        for(let folder of folders){
           for(let img of folder.files.images.ready){
               if(img.guid == imageGuid){
                   return img
               }
           }
        }
    }
    return null
}

export function getAnyActiveProjectImage(projects){
    var project = getActiveProject(projects)
    var folders = projects.activeProject.folders
    if(project){
        for(let folder of folders){
           for(let img of folder.files.images.ready){
               return img
           }
        }
    }
    return null
}

export function startUpdateActiveProjectImage(){
    return {
        type: types.PROJECTS_ACTIVE_PROJECT_IMAGE_START_UPDATE,
    }
}

export function finishUpdateActiveProjectImage(){
    return {
        type: types.PROJECTS_ACTIVE_PROJECT_IMAGE_FINISH_UPDATE,
    }
}

export function selectActiveProjectImageTask(guid){
    return {
        type: types.PROJECTS_ACTIVE_PROJECT_IMAGE_TASK_SELECTED,
        guid
    }
}

export function activeProjectTaskUpdated(task, force=false){
    return function (dispatch, getState) {
        var {projects, auth} = getState()
        var project = getActiveProject(projects)
        if (!project || project.id != task.project_id) {
            return
        }
        var user = auth.user
        var userLink = task.getUser(user.id, ['task', 'info'])
        var isOwner = task.owner_id == user.id
        var taskUnread = task.isUnreadForUser(user.id)
        var isWorker = project.checkUserRole(user.id, 'worker')
        var validTasksSets = []
        var tasksSets = projects.activeProject.tasksSets

        if (!task.isDeleted()) {
            if (task.type == 'alert' && !isWorker) {
                if (isOwner) {
                    validTasksSets.push('alerts')
                    validTasksSets.push('overviewAlerts')
                } else if (userLink && userLink.status != 'done'){
                    validTasksSets.push('alerts')
                }
            } else {
                if (!isOwner) {
                    if (userLink) {
                        if (userLink.status == 'done') {
                            validTasksSets.push('tasksDone')
                        } else {
                            validTasksSets.push('tasksInbox')
                        }
                    }
                } else {
                    if(task.type == 'task'){
                        validTasksSets.push('overviewTasks')
                    }
                    if (task.status == "done") {
                        validTasksSets.push('tasksDone')
                    } else {
                        if (userLink && userLink.status != 'done') {
                            validTasksSets.push('tasksInbox')
                        }
                        validTasksSets.push('tasksOutbox')
                    }
                }
            }
            if (task.image_id > 0) {
                validTasksSets.push(`image${task.image_id}Tasks`)
                validTasksSets.push(`allImagesTasks`)
            }
        }
        for (let setName of Object.keys(tasksSets)) {
            var setData = tasksSets[setName]
            var view = setData && setData.filterParams ? setData.filterParams['view'] : 'default'
            if(task.isDeleted()){
                dispatch({
                    type: types.PROJECTS_ACTIVE_PROJECT_TASK_DELETED,
                    task,
                    setName,
                    view
                })
            }else{
                if(view == 'byuser'){
                    dispatch({
                        type: types.PROJECTS_ACTIVE_PROJECT_TASK_UPDATED,
                        task,
                        setName,
                        view
                    })
                    continue
                }

                var items = setData.items !== null ? setData.items : []
                var taskInSet = items.indexOf(task.guid) != -1
                var isSetValid = validTasksSets.indexOf(setName) != -1

                if (!isSetValid && taskInSet) {
                    dispatch({
                        type: types.PROJECTS_ACTIVE_PROJECT_TASK_DELETED,
                        task,
                        setName,
                        view
                    })
                    continue
                }
                let isUnread = taskUnread && ['tasksInbox', 'tasksOutbox', 'tasksDone', 'alerts'].indexOf(setName) != -1
                if (isSetValid && ((taskInSet || force) || isUnread)) {
                    dispatch({
                        type: types.PROJECTS_ACTIVE_PROJECT_TASK_UPDATED,
                        task,
                        setName,
                        unread: isUnread,
                        view
                    })
                }
            }
        }
    }
}

export function activeProjectTaskDetailsUpdated(updatedTask){
    return function (dispatch, getState){
        var {projects} = getState()
        var task = projects.activeProject ? projects.activeProject.taskDetails.task : null

        if(task && task.id == updatedTask.id){
            dispatch({
                type: types.PROJECTS_ACTIVE_PROJECT_TASK_DETAILS_UPDATED,
                task:updatedTask
            })
        }
    }
}

export function activeProjectTaskDetailsDeleted(deletedTask){
    return function (dispatch, getState){
        var {projects} = getState()
        var task = projects.activeProject ? projects.activeProject.taskDetails.task : null

        if(task && task.id == deletedTask.id){
            dispatch({
                type: types.PROJECTS_ACTIVE_PROJECT_TASK_DETAILS_DELETED
            })
        }
    }
}

export function resetActiveProjectTaskDetails(){
    return {
        type: types.PROJECTS_ACTIVE_PROJECT_TASK_DETAILS_DELETED
    }
}

export function startProjectTimerRequest(project, callback){
    return (dispatch, getState) => {
        var params = {data: JSON.stringify([{start_geostatus: 'pending'}])};
        return POSTRequest(ProjectsUrls.api.projectUserLogs(project.id), params, function(response){
            if (typeof callback == 'function') {
                callback(response)
            }
            dispatch(projectTimerStarted())
        })
    }
}

export function stopProjectTimerRequest(log, callback){
    return (dispatch, getState) => {
        var params = {end_time: 'now', end_geostatus: 'pending'}
        return PUTRequest(ProjectsUrls.api.projectUserLog(log.project_id, log.id), params, function(response){
            if (typeof callback == 'function') {
                callback(response)
            }
            dispatch(projectTimerStopped())
        })
    }
}

export function checkProjectTimerGeolocation(logs){
    return (dispatch, getState) => {
        if(!logs){
            return
        }
        var {projects} = getState()
        if(!projects.projectTimerGeolocationChecking){
            dispatch(projectTimerGeolocationCheckingStarted())
            for(let log of logs){
                if(log.start_geostatus == 'pending'){
                    dispatch(updateProjectTimerGeolocation('start', log))
                }
                if(log.end_geostatus == 'pending'){
                    dispatch(updateProjectTimerGeolocation('end', log))
                }
            }
        }
    }
}

export function updateProjectTimerGeolocation(gtype, log){
    return (dispatch, getState) => {
        var params = {}
        var requestUrl = ProjectsUrls.api.projectUserLog(log.project_id, log.id)

        if (Geolocation.supportGeolocaton()) {
            Geolocation.getCurrentCoordinates((position) => {
                params[gtype + '_coordinates'] = JSON.stringify({
                    'latitude': position.coords.latitude,
                    'longitude': position.coords.longitude
                })
                params[gtype + '_geostatus'] = 'allowed'
                PUTRequest(requestUrl, params)
            }, (error) => {
                console.log(error)
                if (error) {
                    params[gtype + '_geostatus'] = error.code == 1 ? 'denied' : 'error'
                    PUTRequest(requestUrl, params)
                }
            });
        } else {
            params[gtype + '_geostatus'] = 'nosupport'
            PUTRequest(requestUrl, params)
        }
    }
}

export function projectTimerGeolocationCheckingStarted() {
    return {
        type: types.PROJECTS_PROJECT_TIMER_GEOLOCATION_CHECKING_STARTED,
    }
}

export function projectTimerGeolocationCheckingFinished() {
    return (dispatch, getState) => {
        var {projects} = getState()
        if(projects.projectTimerGeolocationChecking){
            dispatch({type: types.PROJECTS_PROJECT_TIMER_GEOLOCATION_CHECKING_FINISHED})
        }
    }
}

export function projectTimerStarted() {
    return {
        type: types.PROJECTS_PROJECT_TIMER_STARTED
    }
}

export function projectTimerStopped() {
    return {
        type: types.PROJECTS_PROJECT_TIMER_STOPPED
    }
}

export function projectTimerShowed(launched, willStop){
    return {
        type: types.PROJECTS_PROJECT_TIMER_SHOWED,
        launched,
        willStop
    }
}

export function projectTimerHided() {
    return {
        type: types.PROJECTS_PROJECT_TIMER_HIDED,
    }
}

export function toggleProjectDrawingRightPanel(dispatch, show=null){
    dispatch(function(dispatch, getState){
        var {projects} = getState()
        if(show == null){
            show = projects.activeProject.drawingRightPanel ? false : true
        }
        if(show){
            $('#right-side-overlay').css('transform','translate3d(0, 0, 0)')
            $('#right-side-overlay-scroll').show()
        }else{
            $('#right-side-overlay').css('transform','translate3d(350px, 0, 0)')
            setTimeout(function () {$('#right-side-overlay-scroll').hide() }, 400)
        }
        dispatch({
            type: types.PROJECTS_ACTIVE_PROJECT_DRAWING_RIGHT_PANEL_TOGGLE,
            value: show
        })
    })
}

export function changeProjectDrawingActiveTab(tab, force=false){
    return function(dispatch, getState){
        var {projects} = getState()
        var tasksSet
        var setName
        var tasksSets = projects.activeProject && projects.activeProject.tasksSets ? projects.activeProject.tasksSets : {}
        var currentTab = projects.activeProject ? projects.activeProject.drawingActiveTab : null

        if(force || currentTab != tab){
            $('#right-side-overlay .nav-tabs li').removeClass('active')
            $(`.${tab}`).closest('li').addClass('active')
            $('#right-side-overlay .tab-pane').removeClass('active').hide()
            $(`.${tab}box`).addClass('active').show()

            if(tab == 'drawings-tab'){

            }
            if(tab == 'all-tasks-tab'){
                setName = 'allImagesTasks'
                tasksSet = tasksSets[setName]
                if(!tasksSet || !tasksSet.items.length){
                    dispatch(fetchActiveProjectTasksSetIfNeed(`allImagesTasks`))
                }
            }

            dispatch({
                type: types.PROJECTS_ACTIVE_PROJECT_DRAWING_RIGHT_PANEL_TAB_CHANGED,
                tab
            })
        }
    }
}

export function getActiveProject(projects, guid=null){
    if(projects && projects.activeProject.project && (!guid || projects.activeProject.project.guid == guid)){
        return projects.activeProject.project
    }
    return null
}

export function updateActiveProjectTaskUserLink(project, userLink, params, callback=null){
    return function (dispatch, getState) {
        PUTRequest(ProjectsUrls.api.projectTaskUserLink(project.id, userLink.id), params, function (updatedTask) {
            updatedTask = new ProjectTask(updatedTask)
            dispatch(activeProjectTaskUpdated(updatedTask, true))
            dispatch(activeProjectTaskDetailsUpdated(updatedTask))
            if(typeof callback == 'function'){
                callback(updatedTask)
            }
        })
    }
}

export function updateActiveProjectTaskUserLinks(project, params, callback=null){
    return function (dispatch, getState) {
        PUTRequest(ProjectsUrls.api.projectTaskUserLinks(project.id), params, function (updatedTasks) {
            for(let updatedTask of updatedTasks){
                updatedTask = new ProjectTask(updatedTask)
                dispatch(activeProjectTaskUpdated(updatedTask, true))
                dispatch(activeProjectTaskDetailsUpdated(updatedTask))
            }
            if(typeof callback == 'function'){
                callback()
            }
        })
    }
}

export function updateActiveProjectTask(task, params, callback=null){
    return function (dispatch, getState) {
        PUTRequest(ProjectsUrls.api.projectTask(task.project_id, task.id), params, function (updatedTask) {
            updatedTask = new ProjectTask(updatedTask)
            dispatch(activeProjectTaskUpdated(updatedTask, true))
            dispatch(activeProjectTaskDetailsUpdated(updatedTask))
            if(typeof callback == 'function'){
                callback(updatedTask)
            }
        })
    }
}

export function createActiveProjectTask(projectId, params, callback=null){
    return function (dispatch, getState) {
        POSTRequest(ProjectsUrls.api.projectTasks(projectId), params, function (updatedTask) {
            updatedTask = new ProjectTask(updatedTask)
            dispatch(activeProjectTaskUpdated(updatedTask, true))
            dispatch(activeProjectTaskDetailsUpdated(updatedTask))
            if(typeof callback == 'function'){
                callback(updatedTask)
            }
        })
    }
}

export function forwardActiveProjectTask(task, params, callback=null){
    return function (dispatch, getState) {
        PUTRequest(ProjectsUrls.api.projectTaskForward(task.project_id, task.id), params, function (updatedTask) {
            updatedTask = new ProjectTask(updatedTask)
            dispatch(activeProjectTaskUpdated(updatedTask, true))
            dispatch(activeProjectTaskDetailsUpdated(updatedTask))
            if(typeof callback == 'function'){
                callback(updatedTask)
            }
        })
    }
}

export function deleteActiveProjectTask(task, callback=null){
    return function (dispatch, getState) {
        DELETERequest(ProjectsUrls.api.projectTask(task.project_id, task.id), function () {
            if(typeof callback == 'function'){
                callback()
            }
        })
    }
}

export function changeActiveProjectTaskDetailsViewMode(viewMode){
    return function(dispatch, getState){
        var {projects} = getState()
        var currentViewMode = projects.activeProject.taskDetails.viewMode

        if(currentViewMode !== viewMode){
            dispatch({
                type: types.PROJECTS_ACTIVE_PROJECT_TASK_DETAILS_VIEW_MODE_CHANGED,
                viewMode
            })
        }
    }
}

export function activeProjectTaskDetailsImageCreated(image){
    return {
        type: types.PROJECTS_ACTIVE_PROJECT_TASK_DETAILS_IMAGE_CREATED,
        image
    }
}

export function activateActiveProjectTasksSet(activeSetName){
    return function(dispatch, getState){
        var {projects} = getState()
        var tasksSets = projects.activeProject && projects.activeProject.tasksSets ? projects.activeProject.tasksSets : {}
        for(let setName of Object.keys(tasksSets)){
            var setData = tasksSets[setName]
            if(setName != activeSetName){
                dispatch({
                    type: types.PROJECTS_ACTIVE_PROJECT_TASKS_SET_UNACTIVATED,
                    setName
                })
            }else{
                dispatch({
                    type: types.PROJECTS_ACTIVE_PROJECT_TASKS_SET_ACTIVATED,
                    setName
                })
            }
        }
    }
}

export function addSeenItemsToActiveProjectTasksSet(seenItems, setName){
    return function(dispatch, getState){
        var {projects} = getState()
        var tasksSets = projects.activeProject && projects.activeProject.tasksSets ? projects.activeProject.tasksSets : {}
        var setData = tasksSets[setName]
        if(!setData){
            return
        }
        var setSeenItems = setData.seenItems
        for(let taskGuid of Object.keys(seenItems)){
            if(setSeenItems[taskGuid]){
                delete seenItems[taskGuid]
            }
        }
        if(Object.keys(seenItems).length){
            dispatch({
                type:types.PROJECTS_ACTIVE_PROJECT_TASKS_SET_SEEN_ITEMS_UPDATED,
                seenItems
            })
        }
    }
}

export function removeSeenItemsFromActiveProjectTasksSet(taskGuids, setName){
    return {
        type:types.PROJECTS_ACTIVE_PROJECT_TASKS_SET_SEEN_ITEMS_DELETED,
        setName,
        taskGuids
    }
}

export function handleActiveProjectTasksSetSeenItems(){
    return function(dispatch, getState){
        var {projects, auth} = getState()
        var tasksSets = projects.activeProject && projects.activeProject.tasksSets ? projects.activeProject.tasksSets : {}
        var tasks = projects.activeProject && projects.activeProject.tasks ? projects.activeProject.tasks : {}
        var project = getActiveProject(projects)
        var user = auth.user
        var nowDate = moment().utc()
        var params = []

        for(let setName of Object.keys(tasksSets)){
            let setData = tasksSets[setName]
            let seenItems = setData.seenItems
            let readItems = []

            if(Object.keys(seenItems).length){
                for(let taskGuid of Object.keys(seenItems)){
                    let task = tasks[taskGuid]
                    let taskUserLink = task.getUser(user.id)
                    if(!task || !taskUserLink || !task.isUnreadForUser(user.id)){
                        continue
                    }
                    let seenDate = seenItems[taskGuid]
                    if(nowDate.diff(seenDate, 'seconds') >= 25){
                        readItems.push(taskGuid)
                        params.push({id: taskUserLink.id, read: 'now'})
                    }
                }
            }
            if(readItems.length){
                dispatch(removeSeenItemsFromActiveProjectTasksSet(readItems, setName))
            }
        }
        if(params.length){
            dispatch(updateActiveProjectTaskUserLinks(project, {data: JSON.stringify(params), jssid: '1234'}))
        }
    }
}

export function toggleActiveProjectTasksFilter(status=null){
    return function (dispatch, getState){
        const {projects} = getState()

        var currentStatus = projects.activeProject.tasksFilterVisible
        if(status === null){
            status = !currentStatus
        }
        dispatch({
            type: types.PROJECTS_ACTIVE_PROJECT_TASKS_FILTER_TOGGLED,
            status
        })
    }
}

export function activeProjectTasksSetFilterChanged(setName, params){
    return {
        type: types.PROJECTS_ACTIVE_PROJECT_TASKS_SET_FILTER_CHANGED,
        params,
        setName
    }
}

export function activeProjectTasksSetFilterReset(setName){
    return {
        type: types.PROJECTS_ACTIVE_PROJECT_TASKS_SET_FILTER_RESET,
        setName
    }
}

export function activeProjectTasksSetItemsReset(setName){
    return {
        type: types.PROJECTS_ACTIVE_PROJECT_TASKS_SET_ITEMS_RESET,
        setName
    }
}

export function activeProjectCompanyUsersChanged(companyusers){
    return {
        type: types.PROJECTS_ACTIVE_PROJECT_COMPANYUSERS_CHANGED,
        companyusers
    }
}

export function projectImageUpdated(updatedImage){
    return function (dispatch, getState){
        const {projects} = getState()
        var project = getActiveProject(projects)

        if(updatedImage.project_id == project.id && updatedImage.status == 'ready' && updatedImage.active){
            var image = getActiveProjectImage(updatedImage.guid, projects)
            if(!image){
                dispatch(fetchActiveProjectFoldersIfNeed(true))
            }
        }
    }
}