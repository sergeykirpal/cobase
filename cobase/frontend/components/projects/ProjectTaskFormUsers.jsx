import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import ProjectTaskFormUser from 'components/projects/ProjectTaskFormUser.jsx'


class ProjectTaskFormUsers extends Component {
    render(){
        const {dispatch, environment, task, project, user, renderOwner, ownerId} = this.props;
        var users = []
        var userCompany = user.getCompany()
        var role, markOwner, checked
        var taskUserIds = task ? task.getUserIds('task') : []
        var isGlobalAlert = task && task.alert_type == 'global'

        for(let userLink of project.getUsers()){
            var isOwner = ownerId ? ownerId == userLink.user.id : false
            var isRender = false

            if(!userLink.user || !userLink.user.company || isGlobalAlert || (isOwner && typeof renderOwner != null && !renderOwner)){
                continue
            }

            if(project.checkUserRole(user.id, 'worker')){
                isRender = userLink.user.company.id == userCompany.id
            }else if(project.checkUserRole(userLink.user.id, 'worker')){
                if(userLink.user.company.id == userCompany.id){
                    isRender = true
                }
            }else{
                isRender = true
            }

            if(isRender){
                checked = taskUserIds.indexOf(userLink.user.id) != -1
                if(checked && taskUserIds.length == 1 && taskUserIds.indexOf(user.id) != -1){
                    checked = false
                }
                users.push(<ProjectTaskFormUser key={`project-user-${userLink.user.id}`} isOwner={isOwner} checked={checked} userLink={userLink} />)
            }
        }

        return <div className="project-users">{users}</div>
    }
}

ProjectTaskFormUsers.propTypes = {
    project: PropTypes.object.isRequired,
    renderOwner: PropTypes.bool
}


function mapStateToProps(state, props) {
    const {environment, auth} = state;
    return {
        environment,
        user: auth.user
    };
}

export default connect(mapStateToProps)(ProjectTaskFormUsers);
