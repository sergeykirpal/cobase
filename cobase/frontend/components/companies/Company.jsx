import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';import {Link} from 'react-router'
import {isMobile} from 'utils/environment.es6'
import {CompaniesUrls} from 'constants/Urls.es6'
import Loading from 'components/Loading.jsx'
import {changeLocation} from 'actions/site.es6'
import TopContent from 'components/TopContent.jsx'
import {CompanyManager} from 'classes/companies/company.es6'
import CompanyMember from 'components/companies/CompanyMember.jsx'


class Company extends Component {
    componentDidMount(){
        this.initManager()
    }

    componentWillUnmount(){
        this.removeManager()
    }

    initManager(){
        const {dispatch, environment, user, company, project} = this.props;

        window.companyManager = new CompanyManager({
            box: '.company-members-box',
            company: company,
            dispatch: dispatch
        })
        companyManager.run()
    }

    removeManager(){
        if(window.companyManager){
            delete window.companyManager
        }
    }

    renderCompanyWorkers(){
        const {dispatch, members, company} = this.props;

        var workers = []
        for(let memberLink of members){
            if(memberLink.role == 'worker'){
                workers.push(<CompanyMember key={`company-member-${memberLink.email}`} memberLink={memberLink} company={company} />)
            }
        }

        return <div className="items company-workers">{workers}</div>
    }

    renderCompanyManagers(){
        const {dispatch, members, company} = this.props;

        var managers = []
        for(let memberLink of members){
            if(memberLink.role == 'manager'){
                managers.push(<CompanyMember key={`company-member-${memberLink.email}`} memberLink={memberLink} company={company} />)
            }
        }

        return <div className="items company-managers">{managers}</div>
    }

    render(){
        const {dispatch, user, height} = this.props;

        return (
            <div className="company-box" >
                <TopContent>
                    <div className="block no-margin">
                        <ul className="nav nav-tabs nav-tabs-alt nav">
                            <li className="active"><a className="tab outbox-tab members-tab" role="tab" data-toggle="tab" href="#members-box">{gettext("People")}</a></li>
                            <li><a className="tab inbox-tab workers-reports-tab" role="tab" data-toggle="tab" href="#workers-reports-box">{gettext("Hours")}</a></li>
                        </ul>
                    </div>
                </TopContent>
                <div className="tab-content">
                    <div className="tab-pane unloaded workhours setScrollBar fadeIn" id="workers-reports-box" style={{height: `${height}px`, paddingBottom: '80px'}}>
                        <br />
                        <div className="margin-horizont-15">
                            <h4 className="font-w300 push-15">{gettext("WORKING HOURS")}</h4>
                            <form method="post" className="filter-form">
                                <div className="form-group time-frame time-frame-left col-md-3 col-xs-12">
                                    <div className="input-group date">
                                        <span className="input-group-addon"><i className="si si-calendar"> </i></span>
                                        <input type="text" name="start_date" id="start-date-filter" className="start-date-filter form-control iphoneInput" placeholder={gettext("Start Date")} />
                                        <div id="datepicker-start"></div>
                                    </div>
                                </div>
                                <div className="form-group time-frame time-frame-right col-md-3 col-xs-12">
                                    <div className="input-group date">
                                        <span className="input-group-addon"><i className="si si-calendar"> </i></span>
                                        <input type="text" name="end_date" id="end-date-filter" className="end-date-filter form-control iphoneInput" placeholder={gettext("End Date")} />
                                        <div id="datepicker-end"></div>
                                    </div>
                                </div>
                                <div className="col-md-3 col-xs-12">
                                    <button className="btn btn-success apply-filter-btn" type="button">{gettext("APPLY")}</button>
                                    &nbsp;&nbsp;&nbsp;
                                    <button className="btn btn-danger export-btn" type="button">{gettext("EXPORT")}</button>
                                </div>
                                <div className="clear"></div>
                            </form>
                        </div>
                        <br />

                        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                            <div className="col-xs-8 col-sm-8 col-md-8 col-lg-8 download-title">
                                <h3 className="block-title">{gettext("USERS")}</h3>
                            </div>
                            <div className="clear"></div>
                            <div className="download-battons" style={{display: 'none', marginLeft: '5px'}}>
                                <label className="css-input css-checkbox  css-checkbox-primary">
                                    <input className="download-all-btn" type="checkbox" />
                                    <span> </span>
                                </label>
                                <button className="btn btn-success export-download-btn" type="button">{gettext("Download selected")}</button>
                                &nbsp;&nbsp;&nbsp;
                                <button className="btn btn-warning export-cancel-btn" type="button">{gettext("Cencel")}</button>
                            </div>
                            <br />
                        </div>
                        <div className="clear"></div>
                        <div className="workers-reports-users"></div>
                        <div className="clear"></div>
                    </div>

                    <div className="tab-pane active company-members-body setScrollBar fadeIn" id="members-box" style={{height: `${height}px`, paddingBottom: '80px'}}>
                        <div className="circle-box company-workers company-members">
                            <div className="table-title">{gettext("Workers")}</div>
                            <div className="list-item item-title">
                                <div className="col-md-5 col-xs-4 text-title">
                                    {gettext("Name")}
                                </div>
                                <div className="col-md-5 col-xs-5 text-title">
                                    {gettext("Email")}
                                </div>
                                <div className="col-md-2 col-xs-3 text-title">
                                    {gettext("Action")}
                                </div>
                                <div className="clear"></div>
                            </div>
                            {this.renderCompanyWorkers()}

                            <div className="table-footer add-member">
                                <form>
                                    <div className="col-md-5 col-xs-12">
                                        <div className="form-group">
                                            <input name="name" className="form-control" type="text" placeholder={gettext("Name")} maxLength="100" />
                                            <input name="role" type="hidden" value="wrkr" />
                                        </div>
                                    </div>
                                    <div className="col-md-5 col-xs-12">
                                        <div className="form-group">
                                            <input name="email"
                                                className="form-control"
                                                type="email"
                                                maxLength="100"
                                                placeholder={gettext("E-mail")}
                                                autoComplete="off"
                                                data-error={gettext("Incorrect Email address.")}
                                                data-uniqueemail="true"
                                                data-uniqueemail-error={gettext("Email already in use.")} />
                                            <div className="help-block with-errors"></div>
                                        </div>
                                    </div>
                                    <div className="col-md-2 col-xs-12">
                                        <div className="form-group">
                                            <button type="submit" className="btn btn-success btn-min-width">{gettext("Add")}</button>
                                        </div>
                                    </div>
                                </form>
                                <div className="clear"></div>
                            </div>
                        </div>

                        <div className="circle-box company-managers company-members">
                            <div className="table-title">{gettext("Managers")}</div>
                            {this.renderCompanyManagers()}

                            <div className="table-footer add-member">
                                <form>
                                    <div className="col-md-5 col-xs-12">
                                        <div className="form-group">
                                            <input name="name" className="form-control" type="text" placeholder={gettext("Name")} maxLength="100" />
                                            <input name="role" type="hidden" value="mngr" />
                                        </div>
                                    </div>
                                    <div className="col-md-5 col-xs-12">
                                        <div className="form-group">
                                            <input name="email"
                                                className="form-control"
                                                type="email"
                                                maxLength="100"
                                                placeholder={gettext("E-mail")}
                                                autoComplete="off"
                                                data-error={gettext("Incorrect Email address.")}
                                                data-uniqueemail="true"
                                                data-uniqueemail-error={gettext("Email already in use.")} />
                                            <div className="help-block with-errors"></div>
                                        </div>
                                    </div>
                                    <div className="col-md-2 col-xs-12">
                                        <div className="form-group">
                                            <button type="submit" className="btn btn-success btn-min-width">{gettext("Add")}</button>
                                        </div>
                                    </div>
                                </form>
                                <div className="clear"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="pickadatecontainer"></div>
                <div id="dtBox"></div>
            </div>
        );
    }
}

Company.propTypes = {
    company: PropTypes.object.isRequired,
    members: PropTypes.array.isRequired,
}

function mapStateToProps(state, props) {
    const {environment, auth} = state;

    return {
        environment,
        height: environment.pageContentHeight - environment.topContentHeight,
        user: auth.user,
    };
}

export default connect(mapStateToProps)(Company);
