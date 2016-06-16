import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

class Loading extends Component {
    render(){
        return (
            <div className="loader clear" ><img className="loading" src="/static/img/loading.gif" /></div>
        );
    }
}

function mapStateToProps(state, props) {
    return {}
}

export default connect(mapStateToProps)(Loading);
