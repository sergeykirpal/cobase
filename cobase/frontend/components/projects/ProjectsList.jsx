import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {Link} from 'react-router'
import InfiniteScrolling from 'components/InfiniteScrolling.jsx';
import Loading from 'components/Loading.jsx'
import ProjectActiveListItem from 'components/projects/ProjectActiveListItem.jsx'
import ProjectArchivedListItem from 'components/projects/ProjectArchivedListItem.jsx'
import {fetchProjectsIfNeed, updateProjectsListScroll} from 'actions/projects.es6'
import {itemPosition} from 'utils/list.es6'
import {getScrollPos} from 'utils/environment.es6'
import {isMobile} from 'utils/environment.es6'


class ProjectsList extends Component {
    renderItems(){
        const {dispatch, setData, setName, projects} = this.props;

        const items = setData ? setData.items : [];
        var data = []
        var i = 1
        for(let projectGuid of items){
            let project = projects[projectGuid]
            let key = `${i}-${setName}-${projectGuid}`
            var position = itemPosition(i, items.length)
            var item = setName == 'active'
                ? <ProjectActiveListItem key={key} project={project} position={position} />
                : <ProjectArchivedListItem key={key} project={project} position={position} />
            data.push(item)

            if(isMobile('any') || i % 2 == 0){
                data.push(<div key={`${key}-clear`} className="clear"></div>)
            }

            i += 1
        }
        return data
    }

    loadItems(){
        const {dispatch,  setName} = this.props;
        dispatch(fetchProjectsIfNeed(setName))
    }

    render() {
        const {dispatch, environment, setData, setName} = this.props;
        var loadingMore = setData.isFetching
        var scrollBox = `scroll-box-projects-${setName}`
        var height = environment.pageContentHeight - environment.topContentHeight
        return (
            <InfiniteScrolling
                className={() => `projects projects-${setName} setScrollBar tabbox scroll-box ${scrollBox}`}
                loadingMore={loadingMore}
                loader={<Loading />}
                elementIsScrollable={true}
                items={this.renderItems()}
                loadMore={this.loadItems.bind(this)}
                box={scrollBox}
                containerHeight={`${height}px`}
            />
        )
    }
}

ProjectsList.propTypes = {
    setData: PropTypes.object.isRequired,
    setName: PropTypes.string.isRequired,
    projects: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
    const {environment, routing} = state;
    return {
        environment,
        location: routing.locationBeforeTransitions
    };
}

export default connect(mapStateToProps)(ProjectsList);
