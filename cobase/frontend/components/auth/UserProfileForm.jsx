import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';import {Link} from 'react-router'
import {isMobile} from 'utils/environment.es6'
import {AuthUrls} from 'constants/Urls.es6'
import {UserProfileFormManager} from 'classes/auth/profile.es6'


class UserProfileForm extends Component {
    componentDidUpdate(){
        const {dispatch, user} = this.props;

        if(window.userProfileForm){
            userProfileForm.user = user
        }
    }

    componentDidMount(){
        this.initManager()
    }

    componentWillUnmount(){
        this.removeManager()
    }

    initManager(){
        const {dispatch, environment, user, languageCode} = this.props;

        window.userProfileForm = new UserProfileFormManager({
            box: '.update-profile-form-box',
            messages: '.messages',
            user: user,
            languageCode: languageCode,
            dispatch:dispatch
        })
        userProfileForm.run()
    }

    removeManager(){
        if(window.userProfileForm){
            delete window.userProfileForm
        }
    }

    render(){
        const {dispatch, user, languageCode, visible} = this.props;


        return (
            <div className="profile-edit-form update-profile-form-box" style={{display: visible ? 'block' : 'none'}}>
                <div className="authuser-content">
                    <form id="myForm" className="profile-update-form" method="post" role="form">
                        <div className="form-group">
                            <label>{gettext("Name")}</label>
                            <input defaultValue={user.first_name} type="text" placeholder={gettext("Full Name")} name="first_name" id="first_name" maxLength="100" className="form-control" required="required" data-error={gettext("This field may not be blank.")} />
                            <div className="help-block with-errors"></div>
                        </div>
                        <div className="form-group">
                            <label>{gettext("Username")}</label>
                            <input defaultValue={user.username} type="text" placeholder={gettext("@username")} id="username" name="username" pattern="^[0-9a -z-._]+$" maxLength="50" required="required" data-error={gettext("Incorrect value.")} className="form-control" />
                            <div className="help-block with-errors"></div>
                        </div>
                        <div className="form-group">
                            <label>{gettext("Phone")}</label>
                            <input defaultValue={user.phone} className="form-control" id="phone" maxLength="100" name="phone" placeholder={gettext("Phone")} type="text" />
                        </div>
                        <div className="form-group">
                            <label>{gettext("E-mail")}</label>
                            <input defaultValue={user.email} type="email" placeholder={gettext("Email")} id="email" name="email" maxLength="50" data-error={gettext("Incorrect Email address.")} required className="form-control" />
                            <div className="help-block with-errors"></div>
                        </div>
                        <div className="form-group">
                            <h5 className="push-10-t" style={{marginBottom: '10px'}}>{gettext("Language")}</h5>
                            <select defaultValue={languageCode} className="form-control" name="language">
                                <option value="en" >English</option>
                                <option value="sv" >Svenska</option>
                            </select>
                        </div>
                         <div className="form-group">
                            <label>{gettext("New Password")}</label>
                            <input type="password" className="form-control new-pass" placeholder={gettext("New password")} data-minlength="6" id="new_password" data-minlength-error={gettext("Not long enough")} name="new_password" />
                            <div className="help-block with-errors"></div>
                        </div>
                        <div className="form-group new-pass-aditional" style={{display: 'none'}}>
                            <label>{gettext("New Password Again")}</label>
                            <input type="password" className="form-control pass-again" placeholder={gettext("New Password Again")} />
                            <div className="help-block with-errors"></div>
                        </div>
                        <div className="form-group new-pass-aditional" style={{display: 'none'}}>
                            <label>{gettext("Current Password")}</label>
                            <input type="password" className="form-control current-pass" placeholder={gettext("Current Password")} name="current_password" />
                            <div className="help-block with-errors"></div>
                        </div>
                        <div className="form-group">
                            <div className="profile-image-box my-gallery" itemScope={true} itemType="http://schema.org/ImageGallery">
                                <img className="avatar profile-image" src={user.thumbs.s.url} />
                                <div className="profile-image-uploading"></div>
                            </div>
                            <div className="clear"></div>
                        </div>
                        <div className="form-group task-btn image-upload">
                            <span className="btn fileinput-button" style={{marginTop: '4px'}}>
                                <i className="glyphicon glyphicon-edit"> </i> <span>{gettext("Upload Photo")}</span>
                                <input id="id_image" className="imageupload" type="file" name="files" placeholder="Image" />
                            </span>
                        </div>
                        <div className="messages"></div>
                        <div className="form-group edit-btns" >
                            <div className="pull-left">
                                <button type="submit" className="submit-btn btn btn-primary">{gettext("Save")}</button>
                            </div>
                            <div className="pull-left margin-horizont-15">
                                <button type="button" className="btn cancel-submit-btn btn-danger">{gettext("Cancel")}</button>
                            </div>
                            <div className="clear"></div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}


UserProfileForm.propTypes = {
    user: PropTypes.object.isRequired,
    languageCode: PropTypes.string.isRequired,
}

function mapStateToProps(state, props) {
    const {environment, auth} = state;

    return {
        environment,
        height: environment.pageContentHeight - environment.topContentHeight,
    };
}

export default connect(mapStateToProps)(UserProfileForm);
