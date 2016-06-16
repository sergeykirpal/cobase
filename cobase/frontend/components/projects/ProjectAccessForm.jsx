import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {ProjectAccessManager} from 'classes/projects/project.es6'


class ProjectAccessForm extends Component {
    componentDidMount(){
        this.initManager()
    }

    componentWillUnmount(){
        this.removeManager()
    }

    initManager(){
        const {dispatch, user, access, project} = this.props;

        window.projectAccessMngr = new ProjectAccessManager({
            box: '.project-access-form',
            project: project,
            access: access,
            dispatch: dispatch
        })

        projectAccessMngr.run()
    }

    removeManager(){
        if(window.projectAccessMngr){
            delete window.projectAccessMngr
        }
    }

    onCancelButton(){
        appHistory.goBack()
    }

    render(){
        const {dispatch, user, height, project} = this.props;

        return (
            <div className="project-access-form col-md-12 fadeIn">
                <br />
                <form method="post">
                    <input type="hidden" name="title" value={project.title} />
                    <div className="project-access-box">
                        <div className="total-items-css shares-counter hide">
                            {gettext("Total shares")}: <span className="total-items-numbers"><span className="shares-count"> </span> / <span className="limit"> </span></span>
                        </div>

                        <h3>{gettext("SHARE PROJECT")}</h3>

                        <div className="form-group">
                            <div className="col-md-4 padding-top-5 padding-left">
                                <input type="text" placeholder={gettext("Name")} maxLength="100" className="form-control project-access-add-user-name" />
                                <div className="project-access-user-name-autocomplete"></div>
                            </div>
                            <div className="col-md-5 padding-top-5 padding-left">
                                <input
                                    className="form-control project-access-add-user-email"
                                    name="access_user"
                                    type="email"
                                    maxLength="60"
                                    placeholder={gettext("Email")}
                                    data-error={gettext("Incorrect Email address.")}
                                    data-uniqueemail="true"
                                    data-uniqueemail-error={gettext("Duplicate email.")} />
                                <div className="project-access-user-email-autocomplete"></div>
                                <div className="help-block with-errors"></div>
                            </div>
                            <div className="col-md-3 padding-top-5 padding-left">
                                <button type="button" className="btn btn-primary next-btn add-project-access-user-btn">{gettext("Add User")}</button>
                            </div>
                            <div className="clear"></div>
                        </div>

                        <table className="table table-striped no-margin project-access-users fadeIn" style={{display: 'none'}}>
                            <thead>
                                <tr>
                                    <td>
                                        <label className="css-input css-checkbox css-checkbox-primary">
                                            <input type="checkbox" className="select-project-access-all-users-btn" /><span> </span>
                                        </label>
                                    </td>
                                    <td>
                                        <label className="css-input css-checkbox css-checkbox-primary">{gettext("Worker Name")}</label>
                                    </td>
                                    <td>
                                        <label className="css-input css-checkbox css-checkbox-primary">{gettext("E-mail")}</label>
                                    </td>
                                </tr>
                            </thead>
                            <tbody className="project-access-users-box searchable"> </tbody>
                        </table>
                        <br />
                        <button type="submit" className="btn btn-primary project-access-users next-btn save-share-btn" style={{display: 'none'}}>{gettext("Save")}</button>
                        &nbsp;
                        <button onClick={this.onCancelButton.bind(this)} type="button" className="btn btn-default" >{gettext("Cancel")}</button>
                    </div>
                </form>
                <div className="clear"></div>
            </div>
        )
    }
}

ProjectAccessForm.propTypes = {
    project: PropTypes.object.isRequired,
    access: PropTypes.array.isRequired,
}

function mapStateToProps(state, props) {
    const {environment, auth} = state;
    return {
        environment,
        user: auth.user
    };
}

export default connect(mapStateToProps)(ProjectAccessForm);
