import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {getActiveProject, toggleProjectDrawingRightPanel, changeActiveProjectTaskDetailsViewMode} from 'actions/projects.es6'
import {ProjectTaskMapObjectManager} from 'classes/projects/drawing.es6'
import {isMobile} from 'utils/environment.es6'

class ProjectTaskMapObject extends Component {
    componentWillUnmount(){
        const {dispatch, user, project, image, task} = this.props;
        this.removeMap()
    }

    componentDidMount(){
        const {dispatch, user, project, image, task} = this.props;
        this.initMap()
    }

    removeMap(){
        const {dispatch, user, project, image, task} = this.props;
        if(ptmoMangr){
            ptmoMangr.removeMap()
            window.ptmoMangr = null
        }
    }

    initMap(){
        const {dispatch, user, project, image, task, afterUpdate, mode} = this.props;
        window.ptmoMangr = new ProjectTaskMapObjectManager({
            user: user,
            afterUpdate: afterUpdate,
            image: image,
            task: task,
            project: project,
            mode:mode,
            dispatch: dispatch
        })
        ptmoMangr.initMap()
        ptmoMangr.bindButtons()
        ptmoMangr.createTaskMapObject()
    }

    onCancelButton(){
        const {dispatch} = this.props;
        dispatch(changeActiveProjectTaskDetailsViewMode('view'))
    }

    render() {
        const {dispatch, environment, task, project, user, height, cancelButton} = this.props;

        return (
            <div>
                <div id="ptmo-map" className="project-image">
                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 no-padding">
                        <div id="map" style={{height: `${height}px`}}></div>
                    </div>
                </div>
                {cancelButton ? <button onClick={this.onCancelButton.bind(this)} className="btn btn-default">{gettext("Cancel")}</button> : null}
            </div>

        );
    }
}

ProjectTaskMapObject.propTypes = {
    task: PropTypes.object.isRequired,
    image: PropTypes.object.isRequired,
    project: PropTypes.object.isRequired,
    afterUpdate: PropTypes.func,
    mode: PropTypes.string.isRequired,
}

function mapStateToProps(state, props) {
    const {environment, auth, projects} = state;
    return {
        environment,
        user: auth.user,
    };
}

export default connect(mapStateToProps)(ProjectTaskMapObject);
