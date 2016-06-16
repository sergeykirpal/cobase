import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import * as config from 'constants/Config.es6';
import {fetchUserIfNeed} from 'actions/auth.es6'
import {toggleBackButton} from 'actions/site.es6'
import TopContent from 'components/TopContent.jsx'


class TextContainer extends Component {
    componentDidMount() {
        const {dispatch, setName, setData} = this.props;
        var userFields = config.AUTH_USER_BASE_FIELDS
        dispatch(fetchUserIfNeed(userFields))
        dispatch(toggleBackButton(true))
    }

    render() {
        const {dispatch} = this.props;

        return (
            <div className={`text-page`}  style={{textAlign: 'center'}}>
                <TopContent><span/></TopContent>
                Not Implemented
            </div>
        );
    }
}

function mapStateToProps(state, props) {
    const {environment, main} = state;
    return {
        environment,
    };
}

export default connect(mapStateToProps)(TextContainer);
