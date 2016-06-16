import * as types from 'constants/ActionTypes.es6';
import {arrayOf, normalize} from 'normalizr';
import * as config from 'constants/Config.es6';
import {browserHistory} from 'react-router';
import {WebSocketsManager} from 'utils/connection.es6';
import {push} from 'react-router-redux';
import {userUpdated} from 'actions/auth.es6'
import {updateMobileAppBadge} from 'actions/environment.es6'
import {projectCreated, projectImageUpdated, projectDeleted, projectUpdated, activeProjectTaskUpdated, activeProjectTaskDetailsUpdated, activeProjectTaskDetailsDeleted} from 'actions/projects.es6'
import {Project, ProjectTask} from 'classes/projects/common.es6'

export function initLanguage(){
    return (dispatch, getState) => {
        var lang = document.documentElement.lang
        dispatch(setLanguage(lang));
    }
}

export function initSockJSConnection(){
    return (dispatch, getState) => {
        var {auth} = getState()
        window.socketManager = new WebSocketsManager()
        socketManager.createConnection(config.WEBSOCKETS_URL)
        socketManager.addEventSuscriber('dispatch', function (event, data, time) {
            data = data.data
            dispatch(serverEvent(event, data, time))
            var task
            switch(event){
                case 'auth:authuserdata_updated':
                    dispatch(userUpdated(data))
                    dispatch(updateMobileAppBadge())
                    break;
                case 'projects:project_updated':
                    dispatch(projectUpdated(new Project(data)))
                    break;
                case 'projects:project_created':
                    dispatch(projectCreated(new Project(data)))
                    break;
                case 'projects:project_removed':
                    dispatch(projectDeleted(new Project(data)))
                    break;

                case 'projects:projectimage_updated':
                    dispatch(projectImageUpdated(data))
                    break;

                case 'projects:projecttaskuserlink_updated':
                case 'projects:projecttask_updated':
                    task = new ProjectTask(data)
                    dispatch(activeProjectTaskUpdated(task))
                    break;
                case 'projects:projecttask_created':
                    task = new ProjectTask(data)
                    dispatch(activeProjectTaskUpdated(task, true))
                    break;
                case 'projects:projecttask_removed':
                    task = new ProjectTask(data)
                    dispatch(activeProjectTaskUpdated(task))
                    dispatch(activeProjectTaskDetailsDeleted(task))
                    break;
                case 'projects:projecttasks_updated':
                    for(let task of data){
                        dispatch(activeProjectTaskUpdated(new ProjectTask(task)))
                    }
                    break;
            }
        })
        dispatch(sockJSConnectionCreated())
    }
}

function serverEvent(event, data, time){
    return {
        type: types.SITE_SERVER_EVENT,
        event,
        data,
        time
    }
}

function sockJSConnectionCreated(){
    return {
        type: types.SITE_SOCKJS_CONNECTION_CREATED,
    }
}

export function changeTitle(title) {
    document.title = `${config.SITE_NAME} | ${title}`

    return {
        type: types.SITE_TITLE_CHANGED,
        title
    }
}

export function changeLocation(dispatch, url, condition=null){
    $('.scroll-box').each(function (k, v) {
        var $box = $(this)
        var classes = $box.attr('class')
        for(let cl of classes.split(' ')){
            if(cl.indexOf('scroll-box-') != -1){
                var scrollPos = $box.scrollTop()
                dispatch(updateScrollBoxPosition(cl, scrollPos))
            }
        }
    })

    var needToChange = condition !== null ? Boolean(condition) : true
    if(needToChange){
        appHistory.push(url)
    }
}

export function updateScrollBoxPosition(box, scrollPos){
    return {
        type: types.SITE_SCROLLBOX_POSITION_CHANGED,
        box,
        scrollPos
    }
}

export function setLanguage(language) {
    return {
        type: types.SITE_LANGUAGE_SET,
        language
    }
}

export function toggleBackButton(value) {
    return {
        type: types.SITE_BACK_BUTTON_TOGGLE,
        visible:value
    }
}


