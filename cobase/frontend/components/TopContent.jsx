import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router'
import {isMobile} from 'utils/environment.es6'
import ReactHeight from 'react-height'
import {topContentSizeChanged} from 'actions/environment.es6'


class TopContent extends Component {
    onHeightReady(height){
        var {dispatch} = this.props
        dispatch(topContentSizeChanged(height))
    }

    render(){
        var {children, className} = this.props

        return (
            <ReactHeight className={`topcontent ${className ? className : ''}`} onHeightReady={this.onHeightReady.bind(this)}>
                {children}
            </ReactHeight>
        );
    }
}

function mapStateToProps(state, props) {
    const {environment} = state;

    return {
        environment,
    };
}

export default connect(mapStateToProps)(TopContent);
