import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {Link} from 'react-router'
import {changeLocation} from 'actions/site.es6'
import {ProjectsUrls} from 'constants/Urls.es6'


class ProjectFolder extends Component {
    renderFiles(){
        const {dispatch, environment, project, folder, activeFile, onFileClick} = this.props;
        var files = []
        if(folder.files.images && folder.files.images.ready.length){
            for(let file of folder.files.images.ready){
                if(!file.active){
                    continue
                }
                var activeClass = activeFile && activeFile.id == file.id ? 'active' : ''
                files.push(
                    <tr key={`project-file-${file.id}`} className={`files project-file project-file-${file.id} ${activeClass}`}>
                        <td className="text-center"> </td>
                        <td className="font-w600 text-primary">
                        <a className="pointer" onClick={onFileClick.bind(this, file)}>
                            <i className="fa fa-file-picture-o"> </i> <span className="file-name file-title">{file.name}</span>
                        </a>
                        </td>            
                    </tr>
                )
            }
        }
        return files
    }

    toggleFolderFiles(){
        const {dispatch, environment, project, folder, activeFile} = this.props;
        $(`.project-folder-${folder.id} .panel`).toggleClass('open')
    }
    
    render() {
        const {dispatch, environment, project, folder, activeFile} = this.props;

        var activeClass = activeFile && activeFile.folder_id == folder.id ? 'open' : ''
        return (
            <table className={`js-table-sections table table-hover project-folder project-folder-${folder.id}`}>
                <tbody className={`${activeClass} js-table-sections-header panel panel-default`}>
                    <tr>
                        <td className="text-center toggle-folder-files-btn" width="10%">
                            <i className="fa fa-angle-right" onClick={this.toggleFolderFiles.bind(this)}> </i>
                        </td>
                        <td className="font-w600">
                            <span className="folder-title" onClick={this.toggleFolderFiles.bind(this)}>{folder.title}</span>
                        </td>
                    </tr>
                </tbody>
                <tbody className="folder-files">{this.renderFiles()}</tbody>
            </table>
        );
    }
}

ProjectFolder.propTypes = {
    folder: PropTypes.object.isRequired,
    project: PropTypes.object.isRequired,
    onFileClick: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
    const {environment, auth} = state;
    return {
        environment,
        user: auth.user
    };
}

export default connect(mapStateToProps)(ProjectFolder);
