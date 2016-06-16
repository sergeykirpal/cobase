import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';import {Link} from 'react-router'
import {isMobile} from 'utils/environment.es6'
import {AuthUrls} from 'constants/Urls.es6'


class UserProfileHeader extends Component {
    render(){
        const {dispatch, user} = this.props;

        return (
            <div className="user-profile">            
                <div className="user-info">        
                    <div className="user-photo" style={{backgroundImage: `url(${user.thumbs.s.url})`}}></div>
                    <div className="user-name">
                        {user.first_name}
                    </div>
                    <div className="user-login">
                        @{user.username}
                    </div>
                    <div className="clear"></div>
                </div>
            </div>
        );
    }
}

UserProfileHeader.propTypes = {
    user: PropTypes.object.isRequired,
}

function mapStateToProps(state, props) {
    const {environment, auth} = state;

    return {
        environment,
    };
}

export default connect(mapStateToProps)(UserProfileHeader);
