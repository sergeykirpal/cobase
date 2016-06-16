import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {Link} from 'react-router'
import InfiniteScrolling from 'components/InfiniteScrolling.jsx';
import Loading from 'components/Loading.jsx'
import {fetchActiveProjectTasksSetIfNeed, addSeenItemsToActiveProjectTasksSet} from 'actions/projects.es6'
import {isMobile} from 'utils/environment.es6'
import ProjectTaskListItem from 'components/projects/ProjectTaskListItem.jsx'
import ProjectTaskListTargetUser from 'components/projects/ProjectTaskListTargetUser.jsx'
var moment = require('moment');


class ProjectTasksBaseList extends Component {
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
            let taskUserLink = task.getUser(user.id)
            let status = setName == 'tasksOutbox' && task.owner_id == user.id ? task.status : taskUserLink.status
            var usersString
            if(setName == 'tasksInbox'){
                var ownerLink = task.getUser(task.owner_id)
                usersString = ownerLink ? ownerLink.user.name : ''
            }else{
                usersString = task.membersString()
            }

            let isTaskNew = Boolean(taskUserLink && taskUserLink.new_flag)
            let isTaskUnread = Boolean(taskUserLink && !taskUserLink.read)

            data.push(<ProjectTaskListItem newtask={isTaskNew} unread={isTaskUnread} usersString={usersString} status={status} key={key} task={task} project={project}/>)
            if(isMobile('any') || i % 2 == 0){
                data.push(<div key={`${key}-clear`} className="clear"></div>)
            }

            i += 1
        }
        return data
    }

    renderByUserViewItems(){
        const {dispatch, setData, setName, project, tasks, user} = this.props;

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

                let key = `${i}-${setName}-${targetUserId}-${taskGuid}`
                let status = setName == 'tasksOutbox' && task.owner_id == user.id ? task.status : taskUserLink.status
                var usersString
                if (setName == 'tasksInbox') {
                    var ownerLink = task.getUser(task.owner_id)
                    usersString = ownerLink ? ownerLink.user.name : ''
                } else {
                    usersString = task.membersString()
                }

                let isTaskNew = false
                let isTaskUnread = false

                data.push(<ProjectTaskListItem newtask={isTaskNew} unread={isTaskUnread} usersString={usersString} status={status} key={key} task={task} project={project}/>)
                if (isMobile('any') || i % 2 == 0) {
                    data.push(<div key={`${key}-clear`} className="clear"></div>)
                }

                i += 1
            }
        }
        return data
    }

    renderItems(){
        const {dispatch, setData, user} = this.props;
        const filterParams = setData ? setData.filterParams : {}
        if(!user){
            return null
        }
        return filterParams['view'] == 'byuser' ? this.renderByUserViewItems() : this.renderDefaultViewItems()
    }

    isTargetUserValidForRender(targetUser){
        const {dispatch, user, setData} = this.props;

        var params = setData.filterParams
        var keyword = params['keyword']
        var keywordEmail = keyword.indexOf('@') != -1
        var accessTypes = params['access-type']
        var accessTypeExternal, accessTypeInternal
        var company = user.getCompany()

        if(!accessTypes.length){
            accessTypeExternal = accessTypeInternal = true
        }else{
            accessTypeExternal = accessTypes.indexOf('external') != -1
            accessTypeInternal = accessTypes.indexOf('internal') != -1
        }

        var valid = false
        if(keywordEmail){
            if(keyword.indexOf(targetUser.email) != -1){
                valid = true
            }
        }else{
            if(targetUser.id == user.id){
                valid = true
            }else{
                valid = (accessTypeExternal && targetUser.company.id != company.id) || (accessTypeInternal && targetUser.company.id == company.id)
            }
        }
        return valid
    }

    componentDidUpdate(){
        this.markItemsAsSeen()
    }

    markItemsAsSeen(){
        const {dispatch, setData, setName, project, tasks, user, checkSeenItems} = this.props;

        const setItems = setData && setData.items ? setData.items : []
        const setSeenItems = setData ? setData.seenItems : {}
        const isSetActive = setData ? setData.isActive : false
        const seenItems = {}

        for(let taskGuid of setItems){
            let task = tasks[taskGuid]
            if(!task || !user){
                continue
            }

            let taskUserLink = task.getUser(user.id)
            let isTaskUnread = Boolean(taskUserLink && !taskUserLink.read)
            if(isTaskUnread && isSetActive && checkSeenItems && !setSeenItems[task.guid]){
                if(setName != 'alerts' || task.owner_id == user.id){
                    seenItems[task.guid] = moment().utc()
                }
            }
        }

        if(Object.keys(seenItems).length){
            dispatch(addSeenItemsToActiveProjectTasksSet(seenItems, setName))
        }
    }

    loadItems(){
        const {dispatch,  setName, setData} = this.props;
        if(setData && $(`.project-tasks-${setName}`).hasClass('active')){
            dispatch(fetchActiveProjectTasksSetIfNeed(setName))
        }
    }

    hasMore(){
        const {dispatch, environment, setData, setName} = this.props;

        if(!setData){
            return true
        }

        var items = setData.filterParams['view'] == 'byuser' ? setData.itemsByUser : setData.items
        if(items !== null && !setData.isFetching && !setData.nextUrl){
            return false
        }

        return true
    }

    render() {
        const {dispatch, environment, setData, setName, activeSetName, height} = this.props;
        var loadingMore = setData ? setData.isFetching : false
        var scrollBox = `scroll-box-tasks-${setName}`
        var activeClass = setData && setData.isActive ? 'active' : 'hide'

        return (
            <InfiniteScrolling
                className={() => `${activeClass} project-tasks project-tasks-${setName} setScrollBar tabbox scroll-box ${scrollBox}`}
                loadingMore={loadingMore}
                loader={<Loading />}
                items={this.renderItems()}
                loadMore={this.loadItems.bind(this)}
                hasMore={this.hasMore()}
                box={scrollBox}
                containerHeight={`${height}px`}
            />
        )
    }
}

ProjectTasksBaseList.propTypes = {
    setName: PropTypes.string.isRequired,
    project: PropTypes.object.isRequired,
    height: PropTypes.number.isRequired,
    checkSeenItems: PropTypes.bool,
}

export default ProjectTasksBaseList