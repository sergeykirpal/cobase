import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {modal} from 'react-redux-modal'


class ProjectTaskListTargetUser extends Component {
    render() {
        const {dispatch, targetUser} = this.props;

        return (
            <div>
                <div className={`clear project-task-target-user project-task-target-user-${targetUser.id}`}>
                    <span>{targetUser.name}</span>
                </div>
            </div>
        )
    }
}

ProjectTaskListTargetUser.propTypes = {
    project: PropTypes.object.isRequired,
    targetUser: PropTypes.object.isRequired,
}

function mapStateToProps(state, props) {
    const {environment, auth} = state;
    return {
        environment,
        user: auth.user
    };
}

export default connect(mapStateToProps)(ProjectTaskListTargetUser);
