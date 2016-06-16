import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';import {Link} from 'react-router'
import {isMobile} from 'utils/environment.es6'
import {AuthUrls} from 'constants/Urls.es6'
import Loading from 'components/Loading.jsx'
import {changeLocation} from 'actions/site.es6'
import TopContent from 'components/TopContent.jsx'
import UserProfileHeader from 'components/auth/UserProfileHeader.jsx'
import UserProfileForm from 'components/auth/UserProfileForm.jsx'
import CompanyForm from 'components/companies/CompanyForm.jsx'
import {UserProfileManager, userProfileForm} from 'classes/auth/profile.es6'


class UserProfile extends Component {
    componentDidUpdate(){
        const {dispatch, user} = this.props;

        if(window.userProfileManager){
            userProfileManager.user = user
        }
    }

    componentDidMount(){
        this.initManager()
    }

    componentWillUnmount(){
        this.removeManager()
    }

    initManager(){
        const {dispatch, environment, user, company, project} = this.props;

        window.userProfileManager = new UserProfileManager({
            profileBox: '#profile-box',
            projectsReportsBox: '#projects-reports-box',
            companyBox: '#company-box',
            user: user,
            dispatch:dispatch
        })
        userProfileManager.run()
    }

    removeManager(){
        if(window.userProfileManager){
            delete window.userProfileManager
        }
    }

    renderCompanyServices(){
        const {dispatch, user, height, languageCode} = this.props;
        var services = user.company_services
        var items = []
        for(let service of services){
            if(service.active){
                items.push(<span key={`company-service-${service.id}`} className="service">{service.title}&nbsp;<span className="comma">,</span></span>)
            }
        }
        return <div className="company-fields-of-operation">{items}</div>
    }

    render(){
        const {dispatch, user, height, languageCode} = this.props;
        var companyUserRole = user.company.user.role
        return (
            <div className="user-profile-box">
                <TopContent>
                    <div className="block" style={{marginBottom: '1px'}}>
                        <ul className="nav nav-tabs nav-tabs-alt profile-tabs">
                            <li className="active">
                                <a className="profile-tab" href="javascript://">{gettext("MY PROFILE")}</a>
                            </li>
                            <li>
                                <a className="projects-reports-tab" href="javascript://">{gettext("HOURS")}</a>
                            </li>
                            <li>
                                <a className="company-tab" href="javascript://">{gettext("COMPANY")}</a>
                            </li>
                        </ul>
                    </div>
                </TopContent>
                
                <div className="progress progress-top" style={{display: 'none', position: 'fixed'}}>
                    <div className="progress-bar progress-bar-danger" role="progressbar" aria-valuemin="0" aria-valuemax="100" ><span className="persent">0%</span></div>
                </div>
                
                <div className="setScrollBar tab-pane fadeIn" id="profile-box" style={{height: `${height}px`}}>
                    <UserProfileHeader user={user}/>
                    <div className="block">
                        <div className="block-content tab-content">
                                <h4 className="font-w300 push-15">{gettext("PERSONAL INFORMATION")}
                                    <div className="pull-right">
                                        <a className="show-profile-form-btn" href="javascript://" title={gettext("Edit Profile")}><i className="si si-settings"> </i></a>
                                    </div>
                                </h4>
            
                                <ul className="list list-simple list-li-clearfix profile-information">
                                    <li>
                                        <h5 className="push-10-t">{gettext("Name")}</h5>
                                        <div className="font-s13">
                                            {user.first_name}
                                        </div>
                                    </li>
                                    <li>
            
                                        <h5 className="push-10-t">{gettext("Username")}</h5>
                                        <div className="font-s13">
                                            {user.username}
                                        </div>
                                    </li>
                                    <li>
                                        <h5 className="push-10-t">{gettext("Phone")}</h5>
                                        <div className="font-s13">
                                            {user.phone}
                                        </div>
                                    </li>
                                    <li>
                                        <h5 className="push-10-t">{gettext("E-mail")}</h5>
                                        <div className="font-s13">
                                            {user.email}
                                        </div>
                                    </li>
                                    <li>
                                        <h5 className="push-10-t" style={{marginBottom: '10px'}}>{gettext("Language")}</h5>
                                        <span className="lang-sm lang-lbl" lang={languageCode}></span>
                                    </li>
                                </ul>
            
                                <UserProfileForm visible={false} user={user} languageCode={languageCode} />
                        </div>
                    </div>
                </div>
                
                <div className="setScrollBar tab-pane fadeIn unloaded" id="projects-reports-box" style={{display: 'none', height: `${height}px`}}>
                    <UserProfileHeader user={user}/>
            
                    <div className="margin-horizont-15">
                        <br />
                        <h4 className="font-w300 push-15">{gettext("WORKING HOURS")}</h4>
            
                        <form method="post" className="filter-form">
                            <div className="form-group time-frame time-frame-left col-md-3 col-xs-12">
                                <div className="input-group date">
                                    <span className="input-group-addon"><i className="si si-calendar"> </i></span>
                                    <input type="text" name="end_date" data-date="" data-date-format="DD/MM/YYYY" className="start-date-filter form-control iphoneInput" placeholder={gettext("Start Date")} />
                                    <div id="datepicker-start"></div>
                                </div>
                            </div>
                            <div className="form-group time-frame time-frame-right col-md-3 col-xs-12">
                                <div className="input-group date">
                                    <span className="input-group-addon"><i className="si si-calendar"> </i></span>
                                    <input type="text" name="start_date" data-date="" data-date-format="DD/MM/YYYY" className="end-date-filter form-control iphoneInput" placeholder={gettext("End Date")} />
                                    <div id="datepicker-end"></div>
                                </div>
                            </div>
                            <div className="col-md-3 col-xs-12">
                                <button className="btn btn-success apply-filter-btn" type="button">{gettext("APPLY")}</button>
                            </div>
                            <div className="clear"></div>
                        </form>
                    </div>
                    <div className="clear"></div>
                    <br />
                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                        <div className="col-xs-8 col-sm-8 col-md-8 col-lg-8"><h3 className="block-title">{gettext("DATE")}</h3></div>
                        <div className="col-xs-4 col-sm-4 col-md-4 col-lg-4"><h3 className="block-title">{gettext("TIME")}</h3></div>
                    </div>
                    <div className="clear"></div>
                    <div className="projects-reports-items"></div>
                </div>

                <div className="setScrollBar tab-pane fadeIn" id="company-box" style={{display: 'none', height: `${height}px`}}>
                    <UserProfileHeader user={user}/>
                    <div className="block">
                        <div className="block-content tab-content">
                            <h4 className="font-w300 push-15">{gettext("COMPANY")}
                                {companyUserRole == 'manager' ? <div className="pull-right"><a className="edit-company-btn" href="javascript://" title="Edit Company"><i className="si si-settings"> </i></a></div> : null}
                            </h4>

                            <ul className="list list-simple list-li-clearfix additional-block company-view">
                                <li>
                                    <h5 className="push-10-t">{gettext("Name")}</h5>
                                    <div className="font-s13">
                                        {user.company.title}
                                    </div>
                                </li>
                                <li>

                                    <h5 className="push-10-t">{gettext("Organization number")}</h5>
                                    <div className="font-s13">
                                        {user.company.reg_number}
                                    </div>
                                </li>
                                <li>
                                    <h5 className="push-10-t">{gettext("Address")}</h5>
                                    <div className="font-s13">
                                        {user.company.address}
                                    </div>
                                </li>
                                <li>
                                    <h5 className="push-10-t">{gettext("Field of operation")}</h5>
                                    {this.renderCompanyServices()}
                                </li>
                                {user.company.owner_id != user.id ? <li><button type="button" className="leave-company-btn btn-danger">{gettext("LEAVE COMPANY")}</button></li> : null}
                            </ul>
                            <CompanyForm user={user} company={user.company} services={user.company_services} />
                        </div>
                    </div>
                </div>
                
                <div id="pickadatecontainer"></div>
            </div>
        );
    }
}

UserProfile.propTypes = {
    user: PropTypes.object.isRequired,
}

function mapStateToProps(state, props) {
    const {environment, auth} = state;

    return {
        environment,
        height: environment.pageContentHeight - environment.topContentHeight,
        languageCode: document.documentElement.lang
    };
}

export default connect(mapStateToProps)(UserProfile);
