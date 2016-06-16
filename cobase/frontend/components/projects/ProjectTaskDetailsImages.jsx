import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {isMobile} from 'utils/environment.es6'
import {changeLocation} from 'actions/site.es6'
import {ProjectsUrls} from 'constants/Urls.es6'
import {ProjectTaskManager} from 'classes/projects/projecttask.es6'


class ProjectTaskDetailsImages extends Component {
    componentDidMount(){
        ProjectTaskManager.initPhotoSwipe('.my-gallery')
    }

    renderImages(){
        const {dispatch, environment, task, project, user} = this.props;

        var images = task.files.images
        var items = []
        for(let image of images){
            items.push(
                <figure key={`task-image-${image.id}`} className="col-xs-6 col-sm-3 col-md-3 col-lg-3 margin-bottom-5" itemProp="associatedMedia" itemScope="" itemType="http://schema.org/ImageObject">
                    <a href={image.thumbs.big.src} className="img-container" itemProp="contentUrl" data-size={`${image.thumbs.big.width}x${image.thumbs.big.height}`}>
                        <img src={image.thumbs.x.src} itemProp="thumbnail" alt="" className="file-thumb img-responsive" />
                    </a>
                </figure>
            )
        }

        return items
    }

    render() {
        const {dispatch, environment, task, project, user} = this.props;
        var images = task.files.images

        return (
            <div>
                {images.length ? <h3 className="margin-bottom-5 block-title">{gettext("IMAGES")}</h3> : null}
                <div className="project-task-images my-gallery row" itemScope="" itemType="http://schema.org/ImageGallery">
                    {this.renderImages()}
                </div>
            </div>
        )
    }
}

ProjectTaskDetailsImages.propTypes = {
    task: PropTypes.object.isRequired,
    project: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
    const {environment, auth} = state;
    return {
        environment,
        user: auth.user
    };
}

export default connect(mapStateToProps)(ProjectTaskDetailsImages);
