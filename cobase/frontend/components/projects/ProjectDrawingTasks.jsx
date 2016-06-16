import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {isMobile} from 'utils/environment.es6'
import InfiniteScrolling from 'components/InfiniteScrolling.jsx';
import Loading from 'components/Loading.jsx'
import ProjectDrawingTaskItem from 'components/projects/ProjectDrawingTaskItem.jsx'


class ProjectDrawingTasks extends Component {
    renderItems(){
        const {dispatch, environment, items, project, selectedTask, image, user} = this.props;

        var data = []
        if(items.length){
            for(let task of items){
                var key = `project-drawing-task-${task.id}`
                var isSelected = selectedTask == task.guid
                data.push(<ProjectDrawingTaskItem key={key} image={image} project={project} task={task} isSelected={isSelected} />)
                data.push(<div key={`${key}-clear`} className="clear"></div>)
            }
        }

        return data
    }

    componentWillReceiveProps(nextProps){
        const {selectedTask} = this.props;
        if(this.props.selectedTask != nextProps.selectedTask && nextProps.selectedTask){
            $('.drawing-tasks-tabbox').scrollTo($(`.project-task-${nextProps.selectedTask}`))
        }
    }

    render() {
        const {dispatch, environment, height, items} = this.props;

        return (
            <div className="tab-pane setScrollBar fadeIn right-side-tabbox drawing-tasks-tabbox" style={{height: `${height}px`}}>{this.renderItems()}</div>
        );
    }
}

ProjectDrawingTasks.propTypes = {
    height: PropTypes.number.isRequired,
    project: PropTypes.object.isRequired,
    items: PropTypes.array.isRequired,
}

function mapStateToProps(state, props) {
    const {environment, auth} = state;
    return {
        environment,
        user: auth.user
    };
}

export default connect(mapStateToProps)(ProjectDrawingTasks);
