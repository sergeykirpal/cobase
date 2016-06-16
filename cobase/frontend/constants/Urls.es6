import {isActive} from 'react-router'

var urlPrefix = '/spa'

export var AuthUrls = {
    login: '/user/login',
    logout: '/user/logout',
    profile: `${urlPrefix}/profile`,
    api: {
        currentUser: `/api/v1/user/current/`,
        users:`/api/v1/users/`,
        userData: (userId) => `/api/v1/user/${userId}/data/`,
        addProfile: `/api/v1/user/`,
        profile: (userId) => `/api/v1/user/${userId}/profile/`,
        data: (userId) => `/api/v1/user/${userId}/data/`,
        profileImage: (userId) => `/api/v1/user/${userId}/profile/image/`,
        userProjectsReports: (userId) => `/api/v1/user/${userId}/projectsreports/`,
        userProjectsReport: (userId, date) => `/api/v1/user/${userId}/projectsreport/${date}`,
    }
}

export var ChatUrls = {
    chat: `${urlPrefix}/chat`,
}

export var CompaniesUrls = {
    company: `${urlPrefix}/company`,
    api: {
        addCompany: `/api/v1/company/`,
        company: (companyId) => `/api/v1/company/${companyId}/`,
        companyWorker: (companyId) => `/api/v1/company/${companyId}/worker/`,
        companyUserLink: (companyId, linkId) => `/api/v1/company/${companyId}/userlink/${linkId}/`,
        companyUserInvite: (companyId, inviteId) => `/api/v1/company/${companyId}/userinvite/${inviteId}/`,
        companyAddUserInvite: (companyId) => `/api/v1/company/${companyId}/userinvite/`,
        companyUserInvites: (companyId) => `/api/v1/company/${companyId}/userinvites/`,
        companyWorkersReports: (companyId) => `/api/v1/company/${companyId}/workersreports/`,
    }
}

export var PaymentsUrls = {
    payments: `${urlPrefix}/payments`,
    api: {
    }
}

export var MobileAppUrls = {
    api: {
        device: '/api/v1/mobileapp/device/'
    }
}

export var ProjectsUrls = {
    project:(guid, filter) => `${urlPrefix}/project/${guid}/${filter}`,
    projectDrawing:(guid, drawingGuid) => `${urlPrefix}/project/${guid}/drawing/${drawingGuid}`,
    projectTask: (guid, taskGuid) => `${urlPrefix}/project/${guid}/task/${taskGuid}`,
    projectTaskAdd: (guid, taskType) => `${urlPrefix}/project/${guid}/task/add/${taskType}`,
    projectTasks: (guid) => `${urlPrefix}/project/${guid}/tasks`,
    projectAdd: `${urlPrefix}/projects/add`,
    projects: (type='') => `${urlPrefix}/projects/${type}`,
    api: {
        projects: `/api/v1/projects/`,
        addProject: `/api/v1/project/`,
        project: (projectId) => `/api/v1/project/${projectId}/`,
        projectUserLink: (projectId, linkId) => `/api/v1/project/${projectId}/userlink/${linkId}/`,
        projectUserLogs: (projectId) => `/api/v1/project/${projectId}/projectuserlogs/`,
        projectUserLog: (projectId, logId) => `/api/v1/project/${projectId}/projectuserlog/${logId}/`,
        projectFolders: (projectId) => `/api/v1/project/${projectId}/folders/`,
        projectFolder: (projectId, folderId) => `/api/v1/project/${projectId}/folder/${folderId}/`,
        addProjectFolder: (projectId) => `/api/v1/project/${projectId}/folder/`,
        addProjectFile: (projectId) => `/api/v1/project/${projectId}/file/`,
        projectFile: (projectId, fileId) => `/api/v1/project/${projectId}/file/${fileId}/`,
        projectFiles: (projectId) => `/api/v1/project/${projectId}/files/`,
        projectImage: (projectId, fileId) => `/api/v1/project/${projectId}/image/${fileId}/`,
        projectTaskUserLink: (projectId, linkId) => `/api/v1/project/${projectId}/taskuserlink/${linkId}/`,
        projectTaskUserLinks: (projectId) => `/api/v1/project/${projectId}/taskuserlinks/`,
        projectTask: (projectId, taskId) => `/api/v1/project/${projectId}/task/${taskId}/`,
        projectTasks: (projectId) => `/api/v1/project/${projectId}/tasks/`,
        projectTaskForward: (projectId, taskId) => `/api/v1/project/${projectId}/task/${taskId}/forward/`,
        projectTaskImage: (projectId, imgId) => `/api/v1/project/${projectId}/taskimage/${imgId}/`,
        projectTaskImages: (projectId) => `/api/v1/project/${projectId}/taskimages/`,
        projectReportsDiary: (projectId) => `/api/v1/project/${projectId}/reports/diary/`,
        projectReportsDiaryday: (projectId, date) => `/api/v1/project/${projectId}/reports/diaryday/${date}/`,
        projectReportsDiaryexport: (projectId) => `/api/v1/project/${projectId}/reports/diaryexport/`,
        projectReportsTask: (projectId, taskId) => `/api/v1/project/${projectId}/reports/task/${taskId}/`,
        projectReportsAddTask: (projectId) => `/api/v1/project/${projectId}/reports/task/`,
        projectReportsProjectLog: (projectId) => `/api/v1/project/${projectId}/reports/projectlog/`,
        projectReportsProjectLogs: (projectId) => `/api/v1/project/${projectId}/reports/projectlogs/`,
        projectReportsProjectUserLogs: (projectId) => `/api/v1/project/${projectId}/reports/projectuserlogs/`,
        projectReportsProjectLogsExport: (projectId) => `/api/v1/project/${projectId}/reports/projectlogsexport/`,
        projectReportsCustomForms: (projectId) => `/api/v1/project/${projectId}/reports/customforms/`,
    }
}

export var CustomFormsUrls = {
    api: {
        item: (itemId) => `/api/v1/custom_forms/item/${itemId}/`,
        templates: '/api/v1/custom_forms/templates'
    }
}



//var Urls = {
//    project:{
//        upload: (projectGuid) => `/projects/${projectGuid}/upload`,
//        update: (projectGuid) => `/projects/${projectGuid}/update`,
//        share: (projectGuid) => `/projects/${projectGuid}/share`,
//        create: `/projects/add`,
//        overview: (projectGuid) => `/projects/${projectGuid}/overview`,
//        tasks: (projectGuid, params='') => `/projects/${projectGuid}/tasks${params}`,
//        taskForm: (projectGuid) => `/projects/${projectGuid}/tasks/form`,
//        alerts: (projectGuid) => `/projects/${projectGuid}/alerts`,
//        reports: (projectGuid) => `/projects/${projectGuid}/reports`,
//        forms: (projectGuid) => `/projects/${projectGuid}/forms`,
//        drawings: (projectGuid) => `/projects/${projectGuid}/drawings`,
//        api:{
//            addProject: `/api/v1/project/`,
//            project: (projectId) => `/api/v1/project/${projectId}/`,
//            userLink: (projectId, linkId) => `/api/v1/project/${projectId}/userlink/${linkId}/`,
//            projects: `/api/v1/projects/`,
//            userLogs: (projectId) => `/api/v1/project/${projectId}/projectuserlogs/`,
//            userLog: (projectId, logId) => `/api/v1/project/${projectId}/projectuserlog/${logId}/`,
//        }
//    },
//    projectFile:{
//        drawing: (imageGuid) => `/projects/drawing/${imageGuid}`,
//        drawingMap: (imageGuid) => `/projects/drawingmap/${imageGuid}`,
//        api:{
//            addFile: (projectId) => `/api/v1/project/${projectId}/file/`,
//            file: (projectId, fileId) => `/api/v1/project/${projectId}/file/${fileId}/`,
//            files: (projectId) => `/api/v1/project/${projectId}/files/`,
//            image: (projectId, fileId) => `/api/v1/project/${projectId}/image/${fileId}/`,
//            addFolder: (projectId) => `/api/v1/project/${projectId}/folder/`,
//            folder: (projectId, folderId) => `/api/v1/project/${projectId}/folder/${folderId}/`,
//            folders: (projectId) => `/api/v1/project/${projectId}/folders/`,
//        }
//    },
//    projectReports:{
//        api:{
//            addTask: (projectId) => `/api/v1/project/${projectId}/reports/task/`,
//            task: (projectId, taskId) => `/api/v1/project/${projectId}/reports/task/${taskId}/`,
//            projectlogs: (projectId) => `/api/v1/project/${projectId}/reports/projectlogs/`,
//            projectuserlogs: (projectId) => `/api/v1/project/${projectId}/reports/projectuserlogs/`,
//            projectlog: (projectId) => `/api/v1/project/${projectId}/reports/projectlog/`,
//            diaryexport: (projectId) => `/api/v1/project/${projectId}/reports/diaryexport/`,
//            projectlogsexport: (projectId) => `/api/v1/project/${projectId}/reports/projectlogsexport/`,
//            diary: (projectId) => `/api/v1/project/${projectId}/reports/diary/`,
//            diaryday: (projectId, date) => `/api/v1/project/${projectId}/reports/diaryday/${date}/`,
//            customForms: (projectId) => `/api/v1/project/${projectId}/reports/customforms/`,
//        }
//    },
//    projectTask:{
//        view:(guid) => `/projects/task/${guid}`,
//        viewbox: (guid) => `/projects/task/${guid}/box`,
//        api:{
//            tasks: (projectId) => `/api/v1/project/${projectId}/tasks/`,
//            taskFilter: (projectId) => `/api/v1/project/${projectId}/tasks/filter/`,
//            task: (projectId, taskId) => `/api/v1/project/${projectId}/task/${taskId}/`,
//            taskForward: (projectId, taskId) => `/api/v1/project/${projectId}/task/${taskId}/forward/`,
//            userLink: (projectId, linkId) => `/api/v1/project/${projectId}/taskuserlink/${linkId}/`,
//            userLinks: (projectId) => `/api/v1/project/${projectId}/taskuserlinks/`,
//            comments: (projectId, taskId) => `/api/v1/project/${projectId}/task/${taskId}/comments/`,
//            commentLogs: (projectId, taskId) => `/api/v1/project/${projectId}/task/${taskId}/commentlogs/`,
//            images: (projectId) => `/api/v1/project/${projectId}/taskimages/`,
//            image: (projectId, imgId) => `/api/v1/project/${projectId}/taskimage/${imgId}/`,
//        }
//    },
//    profile:{
//        profile: (username) => `/user/${username}`,
//        register: `/user/register`,
//        api:{
//            users:`/api/v1/users/`,
//            addProfile: `/api/v1/user/`,
//            profile: (userId) => `/api/v1/user/${userId}/profile/`,
//            data: (userId) => `/api/v1/user/${userId}/data/`,
//            profileImage: (userId) => `/api/v1/user/${userId}/profile/image/`,
//            projectsReports: (userId) => `/api/v1/user/${userId}/projectsreports/`,
//            projectsReport: (userId, date) => `/api/v1/user/${userId}/projectsreport/${date}`,
//        }
//    },
//    customForms:{
//        api:{
//            item: (itemId) => `/api/v1/custom_forms/item/${itemId}/`
//        }
//    },
//    company:{
//        members: `/company/members`,
//        workers: `/company/workers`,
//        api:{
//            addCompany: `/api/v1/company/`,
//            company: (companyId) => `/api/v1/company/${companyId}/`,
//            companyWorker: (companyId) => `/api/v1/company/${companyId}/worker/`,
//            userLink: (companyId, linkId) => `/api/v1/company/${companyId}/userlink/${linkId}/`,
//            userInvite: (companyId, inviteId) => `/api/v1/company/${companyId}/userinvite/${inviteId}/`,
//            addUserInvite: (companyId) => `/api/v1/company/${companyId}/userinvite/`,
//            userInvites: (companyId) => `/api/v1/company/${companyId}/userinvites/`,
//            workersreports: (companyId) => `/api/v1/company/${companyId}/workersreports/`,
//        }
//    },
//    mobileapp:{
//        api: {
//            device: '/api/v1/mobileapp/device/'
//        }
//    },
//    asyncserver:{
//
//    },
//    payments:{
//        subscribe: `/payments`,
//        api:{
//            subscriptionCard: (planId) => `/api/v1/payments/subscription/card/`,
//            subscriptionFree: (planId) => `/api/v1/payments/subscription/free/`,
//            subscriptionRequest: (planId) => `/api/v1/payments/subscription/request/`
//        }
//    }
//}
//
//module.exports = {
//    Urls: Urls
//}