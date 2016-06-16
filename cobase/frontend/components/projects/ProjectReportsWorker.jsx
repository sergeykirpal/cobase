import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import TopContent from 'components/TopContent.jsx'
import {ProjectReportsForManager} from 'classes/projects/reports.es6'


class ProjectReportsWorker extends Component {
    componentDidMount(){
        this.initManager()
    }

    componentWillUnmount(){
        this.removeManager()
    }

    initManager(){
        const {dispatch, environment, user, access, project} = this.props;

        window.projectReportsForWorker = new ProjectReportsForWorker({
            box: '.project-reports-worker-box',
            project: project,
            user: user,
            modalContentHeight: environment.height - 48,
            windowCoBaseHeight: environment.height,
            NewDesignCoBaseSetHeight: 75,
            blockHeadeIOSApp: 25
        })
        projectReportsForWorker.run()
    }

    removeManager(){
        if(window.projectReportsForWorker){
            delete window.projectReportsForWorker
        }
    }

    render(){
        const {dispatch, user, height, project} = this.props;

        return (
        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 project-reports-worker-box">
            <TopContent>
                <div className="row">
                    <div className="block no-padding no-margin">
                        <ul className="nav nav-tabs nav-tabs-alt nav">
                            <li className="active"><a data-id="diary-box" className="tab diary-tab" href="#diary-box">{gettext("DIARY")}</a></li>
                            <li><a data-id="self-monitor-box" className="tab self-monitor-tab" href="#self-monitor-box">{gettext("FORMS")}</a></li>
                        </ul>
                    </div>
                </div>
            </TopContent>
            
            <div className="project-reports-manager">
                <div className="progress progress-top hidden-sm hidden-md hidden-lg" style={{display: 'none'}}>
                    <div className="progress-bar progress-bar-danger" role="progressbar" aria-valuemin="0" aria-valuemax="100"><span className="persent">0%</span></div>
                </div>
                <div className="clear"></div>
                <div className="row project-reports-worker">
                    <div className="diary-box project-tasks content loading fadeIn">
                        <div className="diary-list diaryweeks setScrollBar"></div>
                    </div>
                    
                     <div className="self-monitor-box project-tasks content loading fadeIn" style={{display: 'none'}}>
                        <div className="self-monitor-list self-monitor-items setScrollBar" style={{height: '200px', paddingBottom: '100px'}}>
                            <div className="input-daterange setDate date-filter form-inline">                            
                                <div className="input-group margin-5">
                                    <span className="input-group-addon"><i className="glyphicon glyphicon-calendar"> </i></span>
                                    <input className="form-control iphoneInput" type="text" id="self-motitor-start-date" name="start_date" placeholder={gettext("Start date")} />
                                </div>
                                
                                <div className="input-group margin-5">
                                    <span className="input-group-addon"><i className="glyphicon glyphicon-calendar"> </i></span>
                                    <input className="form-control iphoneInput" type="text" id="self-motitor-end-date" name="end_date" placeholder={gettext("End date")} />
                                </div>
                                
                                <div className="input-group margin-5 controls text-center">
                                    <button className="btn btn-success apply-filter-btn margin-5">{gettext("APPLY")}</button>                                                                        
                                    <button type="button" className="btn btn-primary show-sm-templates margin-5">{gettext("Use template")}</button>                                
                                </div>                                                                                                                                            
                            </div>                              
                        </div>
                     </div>
                </div>
            </div>
            <div id="pickadatecontainer"></div>
            <div id="dtBox"></div>
        </div>
        )
    }
}

ProjectReportsWorker.propTypes = {
    project: PropTypes.object.isRequired,
}

function mapStateToProps(state, props) {
    const {environment, auth, projects} = state;

    return {
        environment,
        user: auth.user,
        height: environment.pageContentHeight - environment.topContentHeight,
    };
}

export default connect(mapStateToProps)(ProjectReportsWorker);
