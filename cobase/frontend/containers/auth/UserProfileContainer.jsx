import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {changeTitle, toggleBackButton} from 'actions/site.es6'
import {resetActiveProjectTasksSets} from 'actions/projects.es6'
import Loading from 'components/Loading.jsx'
import * as config from 'constants/Config.es6';
import {fetchUserIfNeed} from 'actions/auth.es6'
import {isMobile} from 'utils/environment.es6'
import UserProfile from 'components/auth/UserProfile.jsx'


class UserProfileContainer extends Component {
    componentDidMount() {
        const {dispatch} = this.props;
        dispatch(fetchUserIfNeed(config.AUTH_USER_BASE_FIELDS.concat(['company_services'])))
        dispatch(toggleBackButton(false))
        dispatch(changeTitle(gettext('Profile')))
        dispatch(resetActiveProjectTasksSets(['alerts', 'overviewTasks', 'overviewAlerts', 'tasksInbox', 'tasksOutbox', 'tasksDone']))
    }

    render() {
        const {dispatch, user, height} = this.props;

        if(!user['company_services']){
            return <Loading />
        }

        return (
            <div className={`profile-page pagecontent pagecontent-white pagecontent-hidden`} style={{height: `${height}px`, paddingBottom: '100px'}}>
                <UserProfile user={user}/>
                <div className="clear"></div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {environment, auth, projects} = state;

    var data = {
        environment,
        user: auth.user,
        height: environment.pageContentHeight,
    }

    return data;
}

export default connect(mapStateToProps)(UserProfileContainer);