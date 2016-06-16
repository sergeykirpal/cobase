import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {initEnvironment} from 'actions/environment.es6';
import {initLanguage, initSockJSConnection} from 'actions/site.es6';
import { Link, isActive} from 'react-router'
import {isMobile} from 'utils/environment.es6'
import MenuDesctop from 'components/MenuDesctop.jsx'
import MenuMobile from 'components/MenuMobile.jsx'
import Header from 'components/Header.jsx'
import Footer from 'components/Footer.jsx'
import {getAnyActiveProjectImage, getActiveProjectImage, checkProjectTimerGeolocation, projectTimerGeolocationCheckingFinished} from 'actions/projects.es6'
import {pathMatch} from 'utils/url.es6'
import ProjectDrawingRightPanel from 'components/projects/ProjectDrawingRightPanel.jsx'
import {getActiveProject} from 'actions/projects.es6'


class AppContainer extends Component {
    componentDidMount() {
        const {dispatch, user} = this.props;
        dispatch(initEnvironment());
        dispatch(initLanguage());
        dispatch(initSockJSConnection());

        if(user['projectsuserlogs'] && user['projectsuserlogs']['pending'].length){
            dispatch(checkProjectTimerGeolocation(user['projectsuserlogs']['pending']))
        }
    }

    componentWillReceiveProps(nextProps){
        const {dispatch, user, location} = nextProps;
        const {projectTimerGeolocationChecking} = this.props;

        if(!projectTimerGeolocationChecking && user['projectsuserlogs'] && user['projectsuserlogs']['pending'].length){
            dispatch(checkProjectTimerGeolocation(user['projectsuserlogs']['pending']))
        }

        if(projectTimerGeolocationChecking && user['projectsuserlogs'] && !user['projectsuserlogs']['pending'].length){
            dispatch(projectTimerGeolocationCheckingFinished())
        }

        if(this.props.location.pathname != location.pathname && isMobile('any')){
            if(window.slideout){
                window.slideout.close()
            }
        }
    }

    renderMobileMenu(){
        const {location, projects} = this.props;

        if(isMobile('any')){
            return <MenuMobile path={location.pathname}/>
        }

        return <span />
    }

    renderDesctopMenu(){
        const {environment} = this.props;

        if(!isMobile('any') && environment.pageContentHeight > 0){
            return <MenuDesctop height={environment.pageContentHeight}/>
        }

        return <span />
    }

    renderRightPanel(){
        const {location, projects, params} = this.props;
        var path = location.pathname
        var project = getActiveProject(projects)
        var image

        if(project && pathMatch(path, '/drawing') && params['imageGuid']){
            image = getActiveProjectImage(params['imageGuid'], projects)
            if(image){
                return <ProjectDrawingRightPanel project={project} image={image}/>
            }
        }
        if(project && pathMatch(path, '/drawings')){
            image = getAnyActiveProjectImage(projects)
            return <ProjectDrawingRightPanel project={project} image={image}/>
        }
    }

    getEnvironmentClass(){
        var className = `${isMobile('any') ? 'mobile' : 'desctop'} `
        if(isMobile('iOS')){
            className += 'mobile-ios'
        }else if(isMobile('Android')){
            className += 'mobile-android'
        }
        return className
    }

    renderEmptyLayout(){
        const {children} = this.props
        return <div className={this.getEnvironmentClass()}>{children}</div>
    }

    renderDefaultLayout(){
        const {children} = this.props

        return(
            <div>
                {this.renderMobileMenu()}
                <div id="panel" className={`main container-fluid ${this.getEnvironmentClass()}`}>
                    {this.renderRightPanel()}
                    <div className="mainbox">
                        <Footer />
                        <Header />
                        {this.renderDesctopMenu()}
                        {children}
                    </div>
                    <div className="clear"></div>
                </div>
            </div>
        );

    }

    render() {
        const {location} = this.props
        if(pathMatch(location.pathname, '/chat')){
            return this.renderEmptyLayout()
        }
        return this.renderDefaultLayout()
    }
}

function mapStateToProps(state, props) {
    const {environment, auth, projects, routing} = state;
    return {
        environment,
        user: auth.user,
        projectTimerGeolocationChecking: projects.projectTimerGeolocationChecking,
        projects
    };
}

export default connect(mapStateToProps)(AppContainer);