import * as types from 'constants/ActionTypes.es6';
import * as config from 'constants/Config.es6';
import merge from 'lodash/object/merge';
import {Project} from 'classes/projects/common.es6'


const initialState = {
    projects: {},
    projectsSets: {},
    projectTimerGeolocationChecking: false,
    activeProject:{}
};

const projectsSetInitialState = {
    isFetching: false,
    items: [],
    nextUrl: null,
};

const activeProjectTasksSetFiltersInitialState = function(setName){
    const fields = config.PROJECTS_ACTIVE_PROJECT_TASK_ITEM_FIELDS

    const filterParams = {
        tasksInbox:{fields: fields, type: 'tasks-foruser', keyword: '', view: 'default', targetVisible: false, target: ['received'], statusesVisible: ['todo', 'pause', 'progress'], statuses: [], 'access-type': ['internal', 'external'], accessTypeVisible: true},
        tasksOutbox:{fields: fields, type: 'tasks-owner', keyword: '', view: 'default', targetVisible: false, target: ['sent'], statusesVisible: ['todo', 'pause', 'progress'], statuses: [], 'access-type': ['internal', 'external'], accessTypeVisible: true},
        tasksDone:{fields: fields, type: 'tasks-done', keyword: '', view: 'default', targetVisible: true, target: [], statusesVisible: [], statuses: [], 'access-type': [], accessTypeVisible: false},
        overviewTasks:{fields: fields, type: 'overview-tasks', keyword: '', view: 'default', targetVisible: true, target: ['sent'], statusesVisible: ['todo', 'pause', 'progress', 'done'], statuses: [], 'access-type': ['internal'], accessTypeVisible: true},
        overviewAlerts:{fields: fields, type: 'overview-alerts', keyword: '', view: 'default', targetVisible: true, target: ['sent'], statusesVisible: ['todo', 'pause', 'progress', 'done'], statuses: [], 'access-type': ['internal'], accessTypeVisible: true},
        alerts:{fields: fields, type: 'alerts', keyword: '', view: 'default', targetVisible: true, target: [], statusesVisible: ['todo', 'pause', 'progress', 'done'], statuses: [], 'access-type': [], accessTypeVisible: false},
        default:{fields: fields, type: 'drawing', keyword: '', view: 'default', targetVisible: true, target: [], statusesVisible: [], statuses: [], 'access-type': [], accessTypeVisible: false},
    }

    return filterParams[setName] ? filterParams[setName] : filterParams['default']
}

const activeProjectTasksSetInitialState = function(setName){
    return {
        isFetching: false,
        items: null,
        itemsByUser: null,
        seenItems: [],
        nextUrl: null,
        isActive: false,
        filterParams: activeProjectTasksSetFiltersInitialState(setName)
    }
};

const activeProjectInitialState = {
    project: null,
    activeImageTask:null,
    activeImageUpdating: false,
    isFetching: false,
    isFoldersFetching: false,
    tasksFilterVisible: false,
    tasks: {},
    folders: [],
    tasksSets: {},
    drawingRightPanel: false,
    drawingActiveTab: 'drawings-tab',
    taskDetails: {
        task: null,
        images: [],
        isFetching: false,
        viewMode: 'view'
    },
};

function projectsSet(previousState = projectsSetInitialState, action) {
    var items, previousItems, pos
    if(typeof previousState == 'undefined'){
        previousState = projectsSetInitialState
    }

    switch(action.type) {
        case types.PROJECTS_PROJECTS_REQUEST:
            return Object.assign({}, previousState, {
                isFetching: true,
                nextUrl: action.nextUrl
            });

        case types.PROJECTS_PROJECTS_RESPONSE:
            return Object.assign({}, previousState, {
                isFetching: false,
                items: previousState.items.concat(action.items),
                nextUrl: action.nextUrl
            });

        case types.PROJECTS_PROJECT_UPDATED:
            previousItems = previousState.items !== null ? previousState.items : []
            pos = previousItems.indexOf(action.project.guid)

            if(pos == -1){
                items = [].concat(previousItems)
                items.push(action.project.guid)
            }else{
                items = previousItems
            }

            return Object.assign({}, previousState, {
                items: items
            });

        case types.PROJECTS_PROJECT_DELETED:
            previousItems = previousState.items !== null ? previousState.items : []
            pos = previousItems.indexOf(action.project.guid)

            if(pos != -1){
                items = [].concat(previousItems)
                items.splice(pos, 1)
            }else{
                items = previousItems
            }

            return Object.assign({}, previousState, {
                items: items
            });

        default:
            return previousState;
    }
}

function activeProjectTasksSet(previousState = null, action, tasks) {
    var pos, items, itemsByUser, previousItems, previousItemsByUser
    if(typeof previousState == 'undefined' || previousState === null){
        previousState = activeProjectTasksSetInitialState(action.setName)
    }

    switch(action.type) {
        case types.PROJECTS_ACTIVE_PROJECT_TASKS_REQUEST:
            return Object.assign({}, previousState, {
                isFetching: true,
                nextUrl: action.nextUrl
            });

        case types.PROJECTS_ACTIVE_PROJECT_TASKS_SET_ACTIVATED:
            return Object.assign({}, previousState, {
                isActive: true
            });

        case types.PROJECTS_ACTIVE_PROJECT_TASKS_SET_UNACTIVATED:
            return Object.assign({}, previousState, {
                isActive: false
            });

        case types.PROJECTS_ACTIVE_PROJECT_TASKS_SET_FILTER_CHANGED:
            return Object.assign({}, previousState, {
                filterParams: Object.assign({}, previousState.filterParams, action.params)
            });

        case types.PROJECTS_ACTIVE_PROJECT_TASKS_SET_FILTER_RESET:
            return Object.assign({}, previousState, {
                nextUrl: null,
                items: null,
                itemsByUser: null,
                isFetching: false,
                filterParams: Object.assign({}, activeProjectTasksSetFiltersInitialState(action.setName))
            });

        case types.PROJECTS_ACTIVE_PROJECT_TASKS_SET_ITEMS_RESET:
            return Object.assign({}, previousState, {
                nextUrl: null,
                items: null,
                itemsByUser: null,
                isFetching: false
            });

        case types.PROJECTS_ACTIVE_PROJECT_TASKS_SET_SEEN_ITEMS_UPDATED:
            return Object.assign({}, previousState, {
                seenItems: Object.assign({}, previousState.seenItems, action.seenItems)
            });

        case types.PROJECTS_ACTIVE_PROJECT_TASKS_SET_SEEN_ITEMS_DELETED:
            let seenItems = previousState.seenItems
            for(let taskGuid of action.taskGuids){
                delete seenItems[taskGuid]
            }
            return Object.assign({}, previousState, {
                seenItems: Object.assign({}, seenItems)
            });

        case types.PROJECTS_ACTIVE_PROJECT_TASKS_RESPONSE:
            if(action.userId){
                itemsByUser = previousState.itemsByUser && previousState.itemsByUser[action.userId] ? previousState.itemsByUser[action.userId] : []
                itemsByUser = itemsByUser.concat(action.items)
                return Object.assign({}, previousState, {
                    isFetching: false,
                    itemsByUser: Object.assign({}, previousState.itemsByUser !== null ? previousState.itemsByUser : {}, {[action.userId]: itemsByUser}),
                    nextUrl: action.nextUrl
                });
            }else{
                items = previousState.items
                if(items === null)items = []
                return Object.assign({}, previousState, {
                    isFetching: false,
                    items: items.concat(action.items),
                    nextUrl: action.nextUrl
                });
            }

        case types.PROJECTS_ACTIVE_PROJECT_TASK_UPDATED:
            let task = action.task
            if(action.view == 'byuser'){
                return Object.assign({}, previousState, {
                    itemsByUser: Object.assign({}, previousState.itemsByUser)
                });
            }

            let unread = action.unread
            previousItems = previousState.items !== null ? previousState.items : []
            pos = previousItems.indexOf(task.guid)

            if(pos != -1){
                if(unread){
                    previousItems.splice(pos, 1)
                    items = [task.guid].concat(previousItems)
                }else{
                    items = previousItems
                }
            }else{
                items = [task.guid].concat(previousItems)
            }

            return Object.assign({}, previousState, {
                items: items,
            });

        case types.PROJECTS_ACTIVE_PROJECT_TASK_DELETED:
            previousItems = previousState.items !== null ? previousState.items : []
            pos = previousItems.indexOf(action.task.guid)
            if(pos != -1){
                items = [].concat(previousItems)
                items.splice(pos, 1)
            }else{
                items = previousItems
            }

            previousItemsByUser = previousState.itemsByUser !== null ? previousState.itemsByUser : {}
            let previousItemsByUserChanged = false
            for(let userId of Object.keys(previousItemsByUser)){
                let taskGuids = previousItemsByUser[userId]
                pos = taskGuids.indexOf(action.task.guid)
                if(pos != -1){
                    previousItemsByUser[userId].splice(pos, 1)
                    previousItemsByUserChanged = true

                }
            }
            itemsByUser = previousItemsByUserChanged ? Object.assign({}, previousItemsByUser) : previousItemsByUser

            return Object.assign({}, previousState, {
                items: items,
                itemsByUser: itemsByUser
            });

        default:
            return previousState;
    }
}

export default function projects(previousState = initialState, action) {
    var projects, projectsSets, tasksSets

    switch(action.type) {
        case types.PROJECTS_PROJECTS_REQUEST:
            projectsSets = Object.assign({}, previousState.projectsSets, {[action.setName]: projectsSet(previousState.projectsSets[action.setName], action)})
            return Object.assign({}, previousState, {projectsSets:projectsSets})

        case types.PROJECTS_PROJECTS_RESPONSE:
            projectsSets = Object.assign({}, previousState.projectsSets, {[action.setName]: projectsSet(previousState.projectsSets[action.setName], action)})
            return Object.assign({}, previousState, {projectsSets:projectsSets}, {projects: merge({}, previousState.projects, action.projects)})

        case types.PROJECTS_ACTIVE_PROJECT_TASKS_REQUEST:
        case types.PROJECTS_ACTIVE_PROJECT_TASKS_SET_CREATED:
        case types.PROJECTS_ACTIVE_PROJECT_TASKS_SET_ACTIVATED:
        case types.PROJECTS_ACTIVE_PROJECT_TASKS_SET_UNACTIVATED:
        case types.PROJECTS_ACTIVE_PROJECT_TASKS_SET_SEEN_ITEMS_UPDATED:
        case types.PROJECTS_ACTIVE_PROJECT_TASKS_SET_SEEN_ITEMS_DELETED:
        case types.PROJECTS_ACTIVE_PROJECT_TASKS_SET_FILTER_CHANGED:
        case types.PROJECTS_ACTIVE_PROJECT_TASKS_SET_FILTER_RESET:
        case types.PROJECTS_ACTIVE_PROJECT_TASKS_SET_ITEMS_RESET:
            tasksSets = Object.assign({}, previousState.activeProject.tasksSets, {[action.setName]: activeProjectTasksSet(previousState.activeProject.tasksSets[action.setName], action, previousState.activeProject.tasks)})
            return Object.assign({}, previousState, {activeProject: Object.assign({}, previousState.activeProject, {tasksSets: tasksSets})})

        case types.PROJECTS_ACTIVE_PROJECT_TASKS_RESPONSE:
            tasksSets = Object.assign({}, previousState.activeProject.tasksSets, {[action.setName]: activeProjectTasksSet(previousState.activeProject.tasksSets[action.setName], action)})
            return Object.assign({}, previousState, {activeProject: Object.assign({}, previousState.activeProject, {tasks: merge({}, previousState.activeProject.tasks, action.tasks)}, {tasksSets: tasksSets})})

        case types.PROJECTS_ACTIVE_PROJECT_TASKS_SET_RESET:
            return Object.assign({}, previousState, {activeProject: Object.assign({}, previousState.activeProject, {tasksSets: Object.assign({}, previousState.activeProject.tasksSets, {[action.setName]: activeProjectTasksSetInitialState(action.setName)})})})

        case types.PROJECTS_ACTIVE_PROJECT_TASK_UPDATED:
            tasksSets = Object.assign({}, previousState.activeProject.tasksSets, {[action.setName]: activeProjectTasksSet(previousState.activeProject.tasksSets[action.setName], action, previousState.activeProject.tasks)})
            return Object.assign({}, previousState, {activeProject: Object.assign({}, previousState.activeProject, {tasks: merge({}, previousState.activeProject.tasks, {[action.task.guid]: action.task})}, {tasksSets: tasksSets})})

        case types.PROJECTS_ACTIVE_PROJECT_TASK_DELETED:
            tasksSets = Object.assign({}, previousState.activeProject.tasksSets, {[action.setName]: activeProjectTasksSet(previousState.activeProject.tasksSets[action.setName], action, previousState.activeProject.tasks)})
            return Object.assign({}, previousState, {activeProject: Object.assign({}, previousState.activeProject, {tasks: merge({}, previousState.activeProject.tasks, {[action.task.guid]: null})}, {tasksSets: tasksSets})})

        case types.PROJECTS_ACTIVE_PROJECT_FOLDERS_REQUEST:
            return Object.assign({}, previousState, {activeProject: Object.assign({}, previousState.activeProject, {isFoldersFetching: true})})

        case types.PROJECTS_ACTIVE_PROJECT_FOLDERS_RESPONSE:
            return Object.assign({}, previousState, {activeProject: Object.assign({}, previousState.activeProject, {isFoldersFetching: false, folders: action.folders})})

        case types.PROJECTS_ACTIVE_PROJECT_COMPANYUSERS_CHANGED:
            return Object.assign({}, previousState, {activeProject: Object.assign({}, previousState.activeProject, {project: new Project(Object.assign({}, previousState.activeProject.project, {companyusers: action.companyusers}))})})

        case types.PROJECTS_ACTIVE_PROJECT_REQUEST:
            return Object.assign({}, previousState, {activeProject: Object.assign({}, activeProjectInitialState, {isFetching: true})})

        case types.PROJECTS_ACTIVE_PROJECT_RESPONSE:
        case types.PROJECTS_ACTIVE_PROJECT_UPDATED:
            return Object.assign({}, previousState, {activeProject: Object.assign({}, previousState.activeProject, {isFetching: false, project: action.project})})

        case types.PROJECTS_ACTIVE_PROJECT_DRAWING_RIGHT_PANEL_TOGGLE:
            return Object.assign({}, previousState, {activeProject: Object.assign({}, previousState.activeProject, {drawingRightPanel: action.value})})

        case types.PROJECTS_ACTIVE_PROJECT_DRAWING_RIGHT_PANEL_TAB_CHANGED:
            return Object.assign({}, previousState, {activeProject: Object.assign({}, previousState.activeProject, {drawingActiveTab: action.tab})})

        case types.PROJECTS_ACTIVE_PROJECT_RESET:
            return Object.assign({}, previousState, {activeProject: Object.assign({}, activeProjectInitialState)})

        case types.PROJECTS_ACTIVE_PROJECT_IMAGE_TASK_SELECTED:
            return Object.assign({}, previousState, {activeProject: Object.assign({}, previousState.activeProject, {activeImageTask: action.guid})})

        case types.PROJECTS_ACTIVE_PROJECT_IMAGE_START_UPDATE:
            return Object.assign({}, previousState, {activeProject: Object.assign({}, previousState.activeProject, {activeImageUpdating: true})})

        case types.PROJECTS_ACTIVE_PROJECT_IMAGE_FINISH_UPDATE:
            return Object.assign({}, previousState, {activeProject: Object.assign({}, previousState.activeProject, {activeImageUpdating: false})})

        case types.PROJECTS_ACTIVE_PROJECT_TASK_DETAILS_REQUEST:
            return Object.assign({}, previousState, {activeProject: Object.assign({}, previousState.activeProject, {taskDetails: Object.assign({}, previousState.activeProject.taskDetails, {task:null, isFetching: true})})})

        case types.PROJECTS_ACTIVE_PROJECT_TASK_DETAILS_VIEW_MODE_CHANGED:
            return Object.assign({}, previousState, {activeProject: Object.assign({}, previousState.activeProject, {taskDetails: Object.assign({}, previousState.activeProject.taskDetails, {viewMode:action.viewMode})})})

        case types.PROJECTS_ACTIVE_PROJECT_TASK_DETAILS_RESPONSE:
        case types.PROJECTS_ACTIVE_PROJECT_TASK_DETAILS_UPDATED:
            return Object.assign({}, previousState, {activeProject: Object.assign({}, previousState.activeProject, {taskDetails: Object.assign({}, previousState.activeProject.taskDetails, {task:action.task, isFetching: false, images:[]})})})

        case types.PROJECTS_ACTIVE_PROJECT_TASK_DETAILS_DELETED:
            return Object.assign({}, previousState, {activeProject: Object.assign({}, previousState.activeProject, {taskDetails: Object.assign({}, previousState.activeProject.taskDetails, {task:null, isFetching: false, images: []})})})

        case types.PROJECTS_ACTIVE_PROJECT_TASK_DETAILS_IMAGE_CREATED:
            var images = previousState.activeProject.taskDetails.images.concat([action.image])
            return Object.assign({}, previousState, {activeProject: Object.assign({}, previousState.activeProject, {taskDetails: Object.assign({}, previousState.activeProject.taskDetails, {images: images})})})

        case types.PROJECTS_ACTIVE_PROJECT_TASKS_FILTER_TOGGLED:
            return Object.assign({}, previousState, {activeProject: Object.assign({}, previousState.activeProject, {tasksFilterVisible: action.status})})

        case types.PROJECTS_PROJECT_UPDATED:
        case types.PROJECTS_PROJECT_DELETED:
            projectsSets = Object.assign({}, previousState.projectsSets, {[action.setName]: projectsSet(previousState.projectsSets[action.setName], action)})
            projects = Object.assign({}, previousState.projects, {[action.project.guid]: action.project})
            return Object.assign({}, previousState, {projects: projects, projectsSets: projectsSets})

        case types.PROJECTS_PROJECT_TIMER_GEOLOCATION_CHECKING_STARTED:
            return Object.assign({}, previousState, {projectTimerGeolocationChecking: true})

        case types.PROJECTS_PROJECT_TIMER_GEOLOCATION_CHECKING_FINISHED:
            return Object.assign({}, previousState, {projectTimerGeolocationChecking: false})

        default:
            return previousState
    }
}
