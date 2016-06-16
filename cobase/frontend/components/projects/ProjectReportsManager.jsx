import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import TopContent from 'components/TopContent.jsx'
import {ProjectReportsForManager} from 'classes/projects/reports.es6'


class ProjectReportsManager extends Component {
    componentDidMount(){
        this.initManager()
    }

    componentWillUnmount(){
        this.removeManager()
    }

    initManager(){
        const {dispatch, environment, user, access, project} = this.props;

        window.projectReportsForManager = new ProjectReportsForManager({
            box: '.project-reports-manager-box',
            project: project,
            user: user,
            modalContentHeight: environment.height - 48,
            windowCoBaseHeight: environment.height,
            NewDesignCoBaseSetHeight: 75,
            blockHeadeIOSApp: 25
        })
        projectReportsForManager.run()
    }

    removeManager(){
        if(window.projectReportsForManager){
            delete window.projectReportsForManager
        }
    }

    render(){
        const {dispatch, user, height, project} = this.props;

        return (
        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 project-reports-manager-box">
            <TopContent>
                <div className="row">
                    <div className="block no-padding no-margin">
                        <ul className="nav nav-tabs nav-tabs-alt nav">
                            <li><a data-id="diary-box" className="tab diary-tab" href="#diary-box">{gettext("DIARY")}</a></li>
                            <li><a data-id="self-monitor-box" className="tab self-monitor-tab" href="#self-monitor-box">{gettext("FORMS")}</a></li>
                            <li><a data-id="projectlogsreports-box" className="tab projectlogsreports-tab" href="#projectlogsreports-box">{gettext("HOURS")}</a></li>
                        </ul>
                    </div>
                </div>
            </TopContent>
            <div className="project-reports-manager">
                <div className="progress progress-top hidden-sm hidden-md hidden-lg" style={{display: 'none'}}>
                    <div className="progress-bar progress-bar-danger" role="progressbar" aria-valuemin="0" aria-valuemax="100"><span className="persent">0%</span></div>
                </div>
                <div className="clear"></div>
                <div className="row">
                    <div className="diary-box project-tasks content loading fadeIn" style={{display: 'none'}}>
                        <div className="diary-list diaryweeks setScrollBar" style={{paddingBottom: '100px', height: `${height}px`}}>
                            <div className="input-daterange setDate date-filter form-inline">
                                <div className="input-group margin-5">
                                    <span className="input-group-addon"><i className="glyphicon glyphicon-calendar"> </i></span>
                                    <input className="form-control diary-filter-item iphoneInput" type="text" id="diary-start-date" name="start_date" placeholder={gettext("Period start")} />
                                </div>

                                <div className="input-group margin-5">
                                    <span className="input-group-addon"><i className="glyphicon glyphicon-calendar"> </i></span>
                                    <input className="form-control diary-filter-item iphoneInput" type="text"  id="diary-end-date" name="end_date" placeholder={gettext("Period end")} />
                                </div>
                                <div className="input-group margin-5 text-center">
                                    <button className="btn btn-success apply-filter-btn">{gettext("APPLY")}</button>&nbsp;&nbsp;
                                    <a className="btn btn-warning diary-export-btn" href="javascript://" target="_blank">{gettext("EXPORT")}</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="workhours project-tasks projectlogsreports-box setScrollBar content loading fadeIn" style={{display: 'none', paddingBottom: '100px', height: `${height}px`}}>
                        <div className="input-daterange setDate date-filter form-inline">
                            <div className="input-group margin-5">
                                <span className="input-group-addon"><i className="glyphicon glyphicon-calendar"> </i></span>
                                <input className="form-control projectlogs-filter-item iphoneInput" type="text" id="workhours-start-date" name="start_date" placeholder={gettext("Period start")} />
                            </div>

                            <div className="input-group margin-5">
                                <span className="input-group-addon"><i className="glyphicon glyphicon-calendar"> </i></span>
                                <input className="form-control projectlogs-filter-item iphoneInput" type="text" id="workhours-end-date" name="end_date" placeholder={gettext("Period end")} />
                            </div>
                            <div className="input-group margin-5 text-center">
                                <button className="btn btn-success apply-filter-btn">{gettext("APPLY")}</button>&nbsp;&nbsp;
                                <a className="btn btn-warning projectlogs-export-btn" href="javascript://" target="_blank">{gettext("Export")}</a>
                            </div>
                        </div>
                        <div className="projectlogsreports"></div>
                    </div>
                    <div className="self-monitor-box project-tasks content loading fadeIn" style={{display: 'none'}}>
                        <div className="self-monitor-list self-monitor-items setScrollBar" style={{height: `${height}px`, paddingBottom: '100px'}}>
                            <div className="input-daterange setDate date-filter form-inline">
                                <div className="input-group margin-5">
                                    <span className="input-group-addon"><i className="glyphicon glyphicon-calendar"> </i></span>
                                    <input className="form-control iphoneInput" type="text"  id="self-motitor-start-date" name="start_date" placeholder={gettext("Start date")} />
                                </div>

                                <div className="input-group margin-5">
                                    <span className="input-group-addon"><i className="glyphicon glyphicon-calendar"> </i></span>
                                    <input className="form-control iphoneInput" type="text"  id="self-motitor-end-date" name="end_date" placeholder={gettext("End date")} />
                                </div>

                                <div className="input-group margin-5 controls">
                                    <button type="button" className="btn btn-primary btn-primary-light create-sm-item-last-template hide" style={{display:'none'}}>{gettext("Last used template")}</button>
                                    <button className="btn btn-success apply-filter-btn margin-5">{gettext("APPLY")}</button>
                                    <button type="button" className="btn btn-info create-sm-template margin-5">{gettext("New form")}</button>
                                    <button type="button" className="btn btn-primary show-sm-templates margin-5">{gettext("Use template")}</button>
                                    <button className="btn btn-warning margin-5">{gettext("Export")}</button>
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

ProjectReportsManager.propTypes = {
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

export default connect(mapStateToProps)(ProjectReportsManager);
