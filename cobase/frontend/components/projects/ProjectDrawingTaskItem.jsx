import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {truncate} from 'utils/string.es6'

class ProjectDrawingTaskItem extends Component {
    render() {
        const {dispatch, task, isSelected, user, image} = this.props;
        var userLink = task.getUser(user.id)
        var activeClass = isSelected ? 'active' : ''
        var taskImageGuid = task.image_guid
        var imageGuid = image ? image.guid : ''

        return (
            <div data-imageguid={imageGuid} data-taskguid={task.guid} data-taskimageguid={taskImageGuid} className={`col-xs-12 col-sm-12 col-md-12 col-lg-12 project-task project-task-${task.id} project-task-${task.guid} tasklist ${activeClass}`}>
                <div className="task-content pointer">
                    <h2 className="task-title small-task-title task-details-btn" style={{lineHeight: '23px'}}>
                        {task.has_child || task.is_subtask ? <i className="fa fa-arrow-circle-right forward-label-icon-css" title={gettext("Forward")}> </i> : null}
                        {task.type == "alert" ? <i className="fa fa-bell text-danger" title={gettext("Alert")}> </i> : null}
                        {userLink.status == "progress" ? <span className="label label-warning">{gettext("In progress")}</span> : null}
                        {userLink.status == "pause" ? <span className="label label-danger">{gettext("Pause")}</span> : null}
                        &nbsp;{truncate(task.title,40,40)}
                    </h2>

                    <div className="task-details-btn" >
                        <div className="col-xs-10 col-sm-10 col-md-10 col-lg-10 no-padding">
                            <div className="cut-task-description small-description">{truncate(task.description,40,50)}</div>
                        </div>
                        <div className="col-xs-2 col-sm-2 col-md-2 col-lg-2 pull-right text-right">
                            <i className="fa fa-ellipsis-v project-task-open-button pointer"> </i>
                        </div>
                        <div className="clear"></div>
                    </div>

                    <div className="col-xs-4 col-sm-4 col-md-4 col-lg-4 no-padding">
                        <div className="task-icons">
                            {task.image_id && task.hasCoords() ? <a title={gettext("Find marker")} className="item task-mapobj-btn item-circle bg-default-light text-white-op pointer"><i className="fa fa-map-marker"> </i></a> : null}
                            {task.speciality == "extra" ? <a  title={gettext("Extra work")} className="item item-circle bg-danger text-white-op" href="javascript://" style={{lineHeight:'32px'}}> <i className="glyphicon glyphicon-asterisk"> </i> </a> : null}
                        </div>
                    </div>
                    <div className="col-xs-8 col-sm-8 col-md-8 col-lg-8 task-details-btn" style={{minHeight: '30px'}}>
                        <div className="task-members text-right"><span className="task-members-string">{task.membersString()}</span></div>
                    </div>
                </div>
            </div>
        );
    }
}

ProjectDrawingTaskItem.propTypes = {
    task: PropTypes.object.isRequired,
    isSelected: PropTypes.bool.isRequired,
    project: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
    const {environment, auth} = state;
    return {
        environment,
        user: auth.user
    };
}

export default connect(mapStateToProps)(ProjectDrawingTaskItem);
