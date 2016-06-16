import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';import {Link} from 'react-router'
import {isMobile} from 'utils/environment.es6'
import {CompaniesUrls, AuthUrls} from 'constants/Urls.es6'
import {PUTRequest, POSTRequest, GETRequest, DELETERequest} from 'utils/api.es6'
import {companyUserRemoved} from 'actions/auth.es6'


class CompanyMember extends Component {
    renderRemoveCompanyMemberButton(){
        const {dispatch, user, height, memberLink} = this.props;
        
        if(memberLink.user_id && memberLink.user_id != user.id){
            return <div className="col-md-2 col-xs-3"><button onClick={this.onRemoveCompanyMemberButton.bind(this)} type="button" className="btn btn-danger btn-xs remove-member-btn">{gettext("Remove")}</button></div>
        }
    }

    onRemoveCompanyMemberButton(){
        const {dispatch, user, height, company, memberLink} = this.props;

        swal({
            title: gettext("Are you sure?"),
            text: gettext("You will not be able to recover this company member!"),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: gettext("Yes, delete it!"),
            cancelButtonText: gettext("No, cancel!"),
            closeOnConfirm: false,
            closeOnCancel: false
        }, function(isConfirm){
            if (isConfirm) {
                var url = memberLink.type == 'invite'
                    ? CompaniesUrls.api.companyUserInvite(company.id, memberLink.id)
                    : CompaniesUrls.api.companyUserLink(company.id, memberLink.id)

                DELETERequest(url, function(){
                    dispatch(companyUserRemoved(memberLink))
                    swal({
                        title: gettext('Deleted!'),
                        text: gettext("Your company member has been deleted."),
                        type: "success",
                        timer: 1500,
                        showConfirmButton: false
                    })
                })
            } else {
                swal(gettext("Cancelled"), gettext("Your company member is safe :)"), "error")
            }
        })
    }

    render(){
        const {dispatch, user, height, memberLink} = this.props;

        return (
            <div className={`list-item company-member company-${memberLink.role}`}>
                <div className="col-md-5 col-xs-4 white-space">{memberLink.user.name}</div>
                <div className="col-md-5 col-xs-5 white-space">{memberLink.user.email}</div>
                {this.renderRemoveCompanyMemberButton()}
                {!memberLink.user_id ? <div className="col-md-2 col-xs-3"><button type="button" className="btn btn-danger btn-xs remove-member-btn" onClick={this.onRemoveCompanyMemberButton.bind(this)}>{gettext("Pending")}</button></div> : null}
                <div className="clear"></div>
            </div>
        );
    }
}

CompanyMember.propTypes = {
    company: PropTypes.object.isRequired,
    memberLink: PropTypes.object.isRequired,
}

function mapStateToProps(state, props) {
    const {environment, auth} = state;

    return {
        environment,
        user: auth.user,
    };
}

export default connect(mapStateToProps)(CompanyMember);
