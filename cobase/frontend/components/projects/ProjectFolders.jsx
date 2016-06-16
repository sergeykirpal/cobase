import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {Link} from 'react-router'
import ProjectFolder from 'components/projects/ProjectFolder.jsx'

class ProjectFolders extends Component {
    render(){
        const {dispatch, environment, user, project, folders, activeFile, onFileClick} = this.props;

        var items = []
        for(let folder of folders){
            items.push(<ProjectFolder key={`project-folder-${folder.id}`} onFileClick={onFileClick.bind(this)} activeFile={activeFile} folder={folder} project={project} />)
        }

        return <div className="project-folders">{items}</div>
    }
}

ProjectFolders.propTypes = {
    folders: PropTypes.array.isRequired,
    project: PropTypes.object.isRequired,
    onFileClick: PropTypes.func.isRequired,
}

function mapStateToProps(state, props) {
    const {environment, auth} = state;
    return {
        environment,
        user: auth.user
    };
}

export default connect(mapStateToProps)(ProjectFolders);
