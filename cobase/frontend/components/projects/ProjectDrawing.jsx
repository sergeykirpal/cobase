import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {Link} from 'react-router'
import {getActiveProject, toggleProjectDrawingRightPanel} from 'actions/projects.es6'
import {ProjectDrawingMapManager} from 'classes/projects/drawing.es6'
import {isMobile} from 'utils/environment.es6'


class ProjectDrawing extends Component {
    componentWillUnmount(){
        const {dispatch, user, project, tasks} = this.props;
        this.removeMap()
    }

    componentDidMount(){
        const {dispatch, user, project, image} = this.props;

        toggleProjectDrawingRightPanel(dispatch, !isMobile('any'))
        this.initMap()
    }

    removeMap(){
        const {dispatch, user, project} = this.props;
        if(dmangr){
            dmangr.removeMap()
            window.dmangr = null
        }
    }

    refreshTaskMarkers(){
        const {dispatch, user, items, tasks, selectedTask, isUpdating} = this.props;
        if(!isUpdating && dmangr && items !== null){
            dmangr.tasks = tasks
            dmangr.refreshMapObjects(items, selectedTask)
        }
    }

    componentDidUpdate(){
        const {dispatch, user, items, tasks, selectedTask, isUpdating} = this.props;
        if(dmangr){
            dmangr.isUpdating = isUpdating
        }
        this.refreshTaskMarkers()
    }

    initMap(){
        const {dispatch, user, project, image} = this.props;

        window.dmangr = new ProjectDrawingMapManager({
            user: user,
            image: image,
            project: project,
            dispatch: dispatch
        })
        dmangr.initMap()
        this.refreshTaskMarkers()
    }

    render() {
        const {dispatch, environment, image} = this.props;
        return (
            <div id="project-image" className="project-image">
                <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 no-padding">
                    <div id="map" style={{height: environment.pageContentHeight}}></div>
                </div>
            </div>
        );
    }
}

ProjectDrawing.propTypes = {
    image: PropTypes.object.isRequired,
    project: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
    const {environment, auth} = state;
    return {
        environment,
        user: auth.user,
    };
}

export default connect(mapStateToProps)(ProjectDrawing);
