import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import ProjectTaskListItem from 'components/projects/ProjectTaskListItem.jsx'


class ProjectsTasksCounter extends Component {
    render() {
        const {dispatch, user, project, data, code} = this.props;
        var counter
        var unreadTasks
        var newTasks
        if(!data){
            return <span />
        }

        if(project){
            unreadTasks = data['unread'].length;
            newTasks = data['new'].length;
            if (newTasks > 0) {
                counter = newTasks
            } else if (unreadTasks > 0) {
                counter = <div className="circle">&nbsp;</div>
            }
            if(['sent', 'foruser', 'done'].indexOf(code) != -1){
                return <div className={`cobase-circle-red-dot-for-tabs ${!counter ? 'hide' : ''}`}>{counter}</div>
            }else{
                return <span className={`count tasks pull-right ${!counter ? 'hide' : ''}`}>{counter}</span>
            }
        }
    }
}

ProjectsTasksCounter.propTypes = {
    code: PropTypes.string.isRequired,
    project: PropTypes.object.isRequired,
}

function mapStateToProps(state, props) {
    const {environment, auth} = state;
    var user = auth.user
    var project = props.project
    var data
    if(project){
        if(user['projectstasks'] && user['projectstasks']['byproject'][project.id]){
            data = user['projectstasks']['byproject'][project.id][props.code]
        }
    }


    return {
        environment,
        user,
        data
    };
}

export default connect(mapStateToProps)(ProjectsTasksCounter);
