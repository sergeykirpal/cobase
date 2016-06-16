import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {changeTitle, toggleBackButton} from 'actions/site.es6'
import Loading from 'components/Loading.jsx'
import * as config from 'constants/Config.es6';
import {fetchUserIfNeed} from 'actions/auth.es6'
import {isMobile} from 'utils/environment.es6'
import Company from 'components/companies/Company.jsx'
import {resetActiveProjectTasksSets} from 'actions/projects.es6'


class CompanyContainer extends Component {
    componentDidMount() {
        const {dispatch} = this.props;
        dispatch(fetchUserIfNeed(config.AUTH_USER_BASE_FIELDS.concat(['companyusers']), function(user){
            dispatch(changeTitle(user.company.title))
        }))
        dispatch(toggleBackButton(false))
        dispatch(resetActiveProjectTasksSets(['alerts', 'overviewTasks', 'overviewAlerts', 'tasksInbox', 'tasksOutbox', 'tasksDone']))
    }

    render() {
        const {dispatch, user, height, project} = this.props;

        if(!user['companyusers']){
            return <Loading />
        }

        return (
            <div className={`pagecontent pagecontent-white pagecontent-hidden company-members-box`} style={{height: `${height}px`}}>
                <Company company={user.company} members={user.companyusers}/>
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

export default connect(mapStateToProps)(CompanyContainer);