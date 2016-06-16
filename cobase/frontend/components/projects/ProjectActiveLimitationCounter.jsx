import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {Link} from 'react-router'

class ProjectActiveLimitationCounter extends Component {

    render() {
        const {dispatch, user} = this.props;

        var activeProjectsCount = user.getVar('projectsactive', 'company_projectsactive_count')
        var activeProjectsLimit = user.getVar('projectsactive', 'company_projectsactive_count_limit')
        var userHasActiveProjectsLimitation = activeProjectsLimit !== null

        if(!userHasActiveProjectsLimitation || !user.checkCompanyRole('manager')){
            return <span />
        }

        return (
            <span className="counter">{`(${activeProjectsCount}/${activeProjectsLimit})`}</span>
        )
    }
}

function mapStateToProps(state, props) {
    const {environment, auth} = state;
    return {
        environment,
        user: auth.user
    };
}

export default connect(mapStateToProps)(ProjectActiveLimitationCounter);
