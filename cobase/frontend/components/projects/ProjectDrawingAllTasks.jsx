import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {isMobile} from 'utils/environment.es6'
import InfiniteScrolling from 'components/InfiniteScrolling.jsx';
import Loading from 'components/Loading.jsx'
import ProjectDrawingTaskItem from 'components/projects/ProjectDrawingTaskItem.jsx'
import {fetchActiveProjectTasksSetIfNeed} from 'actions/projects.es6'


class ProjectDrawingAllTasks extends Component {
    renderItems(){
        const {dispatch, environment, items, project, selectedTask, image} = this.props;

        var data = []
        for(let task of items){
            var key = `project-task-${task.id}`
            var isSelected = selectedTask == task.guid
            data.push(<ProjectDrawingTaskItem image={image} key={key} project={project} task={task} isSelected={isSelected} />)
            data.push(<div key={`${key}-clear`} className="clear"></div>)
        }

        return data
    }

    loadItems(){
        const {dispatch, items} = this.props;
        if(items.length && $('.all-tasks-tabbox').hasClass('active')){
            dispatch(fetchActiveProjectTasksSetIfNeed(`allImagesTasks`))
        }
    }

    render() {
        const {dispatch, environment, isFetching, height} = this.props;
        var scrollBox = `scroll-box-all-tasks-tabbox`

        return (
            <InfiniteScrolling
                className={() => `tab-pane setScrollBar fadeIn right-side-tabbox all-tasks-tabbox scroll-box ${scrollBox}`}
                loadingMore={isFetching}
                loader={<Loading />}
                elementIsScrollable={true}
                items={this.renderItems()}
                loadMore={this.loadItems.bind(this)}
                box={scrollBox}
                containerHeight={`${height}px`}
            />
        );
    }
}

ProjectDrawingAllTasks.propTypes = {
    height: PropTypes.number.isRequired,
    project: PropTypes.object.isRequired,
    items: PropTypes.array.isRequired,
    isFetching: PropTypes.bool.isRequired
}

function mapStateToProps(state, props) {
    const {environment, auth} = state;
    return {
        environment,
        user: auth.user
    };
}

export default connect(mapStateToProps)(ProjectDrawingAllTasks);
