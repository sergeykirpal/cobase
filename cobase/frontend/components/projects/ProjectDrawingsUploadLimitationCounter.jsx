import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';

class ProjectDrawingsUploadLimitationCounter extends Component {
    render() {
        const {dispatch, user} = this.props;

        var count = user.getVar('projectsimages', 'company_projectimages_count')
        var limit = user.getVar('projectsimages', 'company_projectimages_count_limit')
        var userHasLimitation = limit !== null

        if(!userHasLimitation){
            return <span />
        }

        return (
            <div className="total-items-css project-drawings-counter">
                {gettext('Total drawings')}: <span className="total-items-numbers warning"><span className="drawings-count">{count}</span> / <span className="limit">{limit}</span></span>
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

export default connect(mapStateToProps)(ProjectDrawingsUploadLimitationCounter);
