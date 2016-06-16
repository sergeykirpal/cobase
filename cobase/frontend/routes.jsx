import React from 'react'
import AppContainer from 'containers/AppContainer.jsx'
import ProjectsContainer from 'containers/projects/ProjectsContainer.jsx'
import ProjectDrawingsContainer from 'containers/projects/ProjectDrawingsContainer.jsx'
import ProjectDrawingContainer from 'containers/projects/ProjectDrawingContainer.jsx'
import ProjectTasksContainer from 'containers/projects/ProjectTasksContainer.jsx'
import ProjectAlertsContainer from 'containers/projects/ProjectAlertsContainer.jsx'
import ProjectOverviewContainer from 'containers/projects/ProjectOverviewContainer.jsx'
import ProjectTaskPageContainer from 'containers/projects/ProjectTaskPageContainer.jsx'
import ProjectPageContainer from 'containers/projects/ProjectPageContainer.jsx'
import ProjectAccessContainer from 'containers/projects/ProjectAccessContainer.jsx'
import ProjectDrawingsUploadContainer from 'containers/projects/ProjectDrawingsUploadContainer.jsx'
import ProjectReportsContainer from 'containers/projects/ProjectReportsContainer.jsx'
import UserProfileContainer from 'containers/auth/UserProfileContainer.jsx'
import CompanyContainer from 'containers/companies/CompanyContainer.jsx'
import ChatContainer from 'containers/chat/ChatContainer.jsx'
import TextContainer from 'containers/TextContainer.jsx'
import {Router, Route, IndexRoute} from 'react-router'


export default (
    <Route path="/spa" component={AppContainer} >
        <Route path="projects" >
            <Route path="add" component={ProjectPageContainer} />
            <Route path="active" setName="active" component={ProjectsContainer} />
            <Route path="archived" setName="archived" component={ProjectsContainer} />
        </Route>
        <Route path="project/:guid" >
            <Route path="tasks" component={ProjectTasksContainer} />
            <Route path="overview" component={ProjectOverviewContainer} />
            <Route path="alerts" component={ProjectAlertsContainer} />
            <Route path="drawings" component={ProjectDrawingsContainer} />
            <Route path="drawing/:imageGuid" component={ProjectDrawingContainer} />
            <Route path="task"  >
                <Route path="add/:taskType" component={ProjectTaskPageContainer} />
                <Route path=":taskGuid" component={ProjectTaskPageContainer} />
            </Route>
            <Route path="reports" component={ProjectReportsContainer} />
            <Route path="update" component={ProjectPageContainer} />
            <Route path="upload" component={ProjectDrawingsUploadContainer} />
            <Route path="share" component={ProjectAccessContainer} />
        </Route>

        <Route path="chat" component={ChatContainer} />
        <Route path="profile" component={UserProfileContainer} />
        <Route path="payments" component={TextContainer} />
        <Route path="company" component={CompanyContainer} />
    </Route>
);