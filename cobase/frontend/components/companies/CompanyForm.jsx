import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';import {Link} from 'react-router'
import {CompanyFormManager} from 'classes/companies/company.es6'

class CompanyForm extends Component {
    componentDidMount(){
        this.initManager()

        $('.company-form .selectpicker').selectpicker({
          style: 'btn-default',
          size: 4
        })
    }

    componentWillUnmount(){
        this.removeManager()
    }

    initManager(){
        const {dispatch, environment, user, company, project} = this.props;

        window.companyFormManager = new CompanyFormManager({
            box: '.company-form',
            user: user,
            dispatch:dispatch
        })
        companyFormManager.run()
    }

    removeManager(){
        if(window.companyFormManager){
            delete window.companyFormManager
        }
    }

    renderCompanyServicesSelect(){
        const {dispatch, user, company, services, visible} = this.props;
        var items = []
        var activeIds = []
        for(let service of services){
            if(service.active){
                activeIds.push(service.id)
            }
            items.push(
                <option key={`company-service-option-${service.id}`} value={service.id}>{service.title}</option>
            )
        }

        return (
            <select defaultValue={activeIds} name="services" id="services" multiple={true} title="Field of operation" className="form-control selectpicker">
                {items}
            </select>
        )
    }

    render(){
        const {dispatch, user, company, services, visible} = this.props;
        
        return (
            <div className="profile-company-update company-form additional-block" style={{display: visible ? 'block' : 'none'}}>
                <form className="profile-company-update-form profile-update-form" method="post" data-toggle="validator" role="form">
                    <div className="form-group">
                        <label>{gettext("Name")}</label>
                        <input defaultValue={company.title} type="text" placeholder="Name" name="title" maxLength="200" className="form-control company-title" required={true} data-error={gettext("This field may not be blank.")} />
                        <div className="help-block with-errors"></div>
                    </div>
                    <div className="form-group">
                        <label>{gettext("Organization number")}</label>
                        <input defaultValue={company.reg_number} type="text" placeholder={gettext("Organization number")} name="reg_number" className="form-control" />
                        <div className="help-block with-errors"></div>
                    </div>
                    <div className="form-group">
                        <label>{gettext("Address")}</label>
                        <input defaultValue={company.address} type="text" placeholder={gettext("Address")} name="address" className="form-control" />
                        <div className="help-block with-errors"></div>
                    </div>
                    <div className="form-group">
                        <label>{gettext("Field of operation")}</label>
                        {this.renderCompanyServicesSelect()}
                        <div className="help-block with-errors"></div>
                    </div>
                    <div className="form-group">
                        <div className="pull-left">
                            <button type="submit" className="save-company-btn btn btn-primary">{gettext("Save")}</button>
                        </div>
                        <div className="pull-left margin-horizont-15">
                            <button type="button" className="cancel-save-company-btn btn btn-danger">{gettext("Cancel")}</button>
                        </div>
                        <div className="clear"></div>
                    </div>
                </form>
            </div>
        );
    }
}

CompanyForm.propTypes = {
    company: PropTypes.object.isRequired,
    services: PropTypes.array.isRequired,
}

function mapStateToProps(state, props) {
    const {environment, auth} = state;

    return {
        environment,
    };
}

export default connect(mapStateToProps)(CompanyForm);
