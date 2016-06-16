import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import ProjectTasksBaseList from 'components/projects/ProjectTasksBaseList.jsx'


class ProjectTasksList extends ProjectTasksBaseList {

}

function mapStateToProps(state, props) {
    const {environment, routing, auth} = state;
    return {
        environment,
        user: auth.user
    };
}

export default connect(mapStateToProps)(ProjectTasksList);
