import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';

class ProjectAccessLimitationCounter extends Component {
    render() {
        const {dispatch, user} = this.props;

        var count = user.getVar('projectsaccess', 'company_projectuseraccess_count')
        var limit = user.getVar('projectsaccess', 'company_projectuseraccess_count_limit')
        var userHasLimitation = limit !== null

        if(!userHasLimitation){
            return <span />
        }

        return (
            <div className="total-items-css shares-counter">
                Total shares: <span className="total-items-numbers warning"><span className="shares-count">{count}</span> / <span className="limit">{limit}</span></span>
            </div>
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

export default connect(mapStateToProps)(ProjectAccessLimitationCounter);
