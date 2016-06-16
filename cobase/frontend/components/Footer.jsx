import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';import {Link} from 'react-router'
import {isMobile} from 'utils/environment.es6'
import {ProjectsUrls} from 'constants/Urls.es6'
import Loading from 'components/Loading.jsx'
import ChatButton from 'components/ChatButton.jsx'
import {changeLocation} from 'actions/site.es6'


class Footer extends Component {
    render(){
        return (
            <div className="footer" >
                <footer className="font-s12 bg-gray-lighter clearfix down-footer">
                    <div className="pull-left down-footer-text">
                        {gettext("Crafted by")} <i className="fa fa-heart text-city"> </i>{gettext("CoBase")}
                    </div>
                </footer>
                <ChatButton />
            </div>
        );
    }
}

function mapStateToProps(state, props) {
    const {environment} = state;

    return {
        environment
    };
}

export default connect(mapStateToProps)(Footer);
