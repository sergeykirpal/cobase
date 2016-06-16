import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';


class ProjectTaskFormUser extends Component {
    render() {
        const {dispatch, userLink, checked, user, isOwner} = this.props;
        var role = userLink.role

        return (
            <div className={`project-user project-user-${role} project-user-${userLink.user.id} checkbox`} data-id={userLink.user.id}>
                <label className="css-input css-checkbox css-checkbox-primary">

                    <div className="pull-left" style={{width:'80px'}}>
                        <input name="users" value={userLink.user.id} type="checkbox" defaultChecked={checked}/>
                        <span> </span>

                        <span className="label label-primary">{role}</span>
                    </div>
                    <div className="pull-left edit-usr-name-css">
                        <i className="fa fa-user"> </i> {userLink.user.name}
                        {userLink.user.id == user.id ? <span className="label label-info">{gettext("Me")}</span> : null}
                        &nbsp;
                        <span className="label label-info user-company-name-css">{userLink.user.company.title}</span>
                        {isOwner ? <span> &nbsp; <span className="label label-danger user-company-name-css">{gettext("Task owner")}</span> </span> : null}
                    </div>
                    <div className="clear"></div>
                </label>
            </div>
        );
    }
}

ProjectTaskFormUser.propTypes = {
    isOwner: PropTypes.bool.isRequired,
    checked: PropTypes.bool.isRequired,
    userLink: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
    const {environment, auth} = state;
    return {
        environment,
        user: auth.user
    };
}

export default connect(mapStateToProps)(ProjectTaskFormUser);
