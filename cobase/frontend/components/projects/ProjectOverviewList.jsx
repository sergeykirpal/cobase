import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import Loading from 'components/Loading.jsx'
import {addSeenItemsToActiveProjectTasksSet} from 'actions/projects.es6'
import {isMobile} from 'utils/environment.es6'
import ProjectTaskListItem from 'components/projects/ProjectTaskListItem.jsx'
import ProjectTasksList from 'components/projects/ProjectTasksList.jsx'
import ProjectTaskListTargetUser from 'components/projects/ProjectTaskListTargetUser.jsx'
import ProjectTasksBaseList from 'components/projects/ProjectTasksBaseList.jsx'


class ProjectOverviewList extends ProjectTasksBaseList {
    isTargetUserValidForRender(targetUser){
        const {dispatch, user, setData} = this.props;

        var params = setData.filterParams
        var keyword = params['keyword']
        var keywordEmail = keyword.indexOf('@') != -1
        var company = user.getCompany()
        var valid = false

        if(keywordEmail){
            if(keyword.indexOf(targetUser.email) != -1){
                valid = true
            }
        }else {
            if(targetUser.id == user.id || targetUser.company.id == company.id){
                valid = true
            }
        }
        return valid
    }

    renderDefaultViewItems(){
        const {dispatch, setData, setName, project, tasks, user} = this.props;

        const setItems = setData && setData.items ? setData.items : [];
        var data = []
        var i = 1
        for(let taskGuid of setItems){
            let task = tasks[taskGuid]
            if(!task){
                continue
            }

            let key = `${i}-${setName}-${taskGuid}`
            let status = task.status
            var usersString = task.membersString()

            data.push(<ProjectTaskListItem newtask={false} unread={false} usersString={usersString} status={status} key={key} task={task} project={project}/>)
            if(isMobile('any') || i % 2 == 0){
                data.push(<div key={`${key}-clear`} className="clear"></div>)
            }

            i += 1
        }
        return data
    }

    renderByUserViewItems(){
        const {dispatch, setData, setName, project, tasks, user} = this.props;

        const filterParams = setData ? setData.filterParams : {}
        const setItems = setData && setData.itemsByUser ? setData.itemsByUser : [];
        var data = []
        var targetUsersIds = []
        var task
        var i

        for(let targetUserId of Object.keys(setItems)){
            let targetUserTasks = setItems[targetUserId]

            i = 1
            for(let taskGuid of targetUserTasks) {
                task = tasks[taskGuid]
                if (!task) {
                    continue
                }

                let taskUserLink = task.getUser(targetUserId)
                if (targetUsersIds.indexOf(targetUserId) == -1) {
                    let targetUser = taskUserLink ? taskUserLink.user : null
                    if (!targetUser || !this.isTargetUserValidForRender(targetUser)) {
                        break
                    } else {
                        data.push(
                            <ProjectTaskListTargetUser key={`project-task-target-user-${targetUserId}`} targetUser={targetUser} project={project}/>)
                        targetUsersIds.push(targetUserId)
                    }
                }

                let target = filterParams['target']
                let key = `${i}-${setName}-${targetUserId}-${taskGuid}`
                let status = target && target.indexOf('received') != -1 ? taskUserLink.status : task.status
                var usersString = task.membersString()

                data.push(<ProjectTaskListItem newtask={false} unread={false} usersString={usersString} status={status} key={key} task={task} project={project}/>)
                if (isMobile('any') || i % 2 == 0) {
                    data.push(<div key={`${key}-clear`} className="clear"></div>)
                }

                i += 1
            }
        }
        return data
    }

    componentDidUpdate(){

    }
}

function mapStateToProps(state, props) {
    const {environment, routing, auth} = state;
    return {
        environment,
        user: auth.user
    };
}

export default connect(mapStateToProps)(ProjectOverviewList);
