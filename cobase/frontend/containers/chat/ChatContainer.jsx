import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import * as config from 'constants/Config.es6';
import {fetchUserIfNeed} from 'actions/auth.es6'
import {resetChatCounters} from 'actions/chat.es6'
import {isMobile} from 'utils/environment.es6'
import Loading from 'components/Loading.jsx'
import {queryString} from 'utils/url.es6'


class ChatContainer extends Component {
    componentDidMount(){
        const {dispatch} = this.props;

        dispatch(fetchUserIfNeed(config.AUTH_USER_BASE_FIELDS, () => {
            dispatch(resetChatCounters())
        }))
    }

    componentWillUnmount(){
        const {dispatch} = this.props;
        dispatch(resetChatCounters())
    }

    onCloseButton(){
        appHistory.goBack()
    }

    render() {
        const {dispatch, user, query, height, sessionId} = this.props;
        var params = query
        params['s'] = sessionId
        var url = `//chat.cobase.se${queryString(params)}`
        var style = {height: `${height}px`}
        var iframeHeight = height
        if(isMobile('iOS')){
            style['paddingTop'] = '25px'
            iframeHeight -= 25
        }

        if(!user.id){
            return <Loading />
        }

        return (
            <div className={`pagecontent setScrollBar chat-box`} style={style}>
                <button type="button" className="btn btn-default btn-lg close-chat-btn" onClick={this.onCloseButton.bind(this)}>
                    <span className="glyphicon glyphicon-remove " ariaHidden="true"> </span>
                </button>
                <div className="clear"></div>
                <iframe className="chat-iframe" width="100%" src={url} frameBorder="0" height={`${iframeHeight}px`}></iframe>
            </div>
        );
    }
}

function mapStateToProps(state, props) {
    const {environment, auth} = state;
    var sessionId = ''
    var user = auth.user
    if(user.id){
        sessionId = user.session_id
    }
    return {
        environment,
        query: props.location.query,
        height: environment.height,
        sessionId,
        user
    };
}

export default connect(mapStateToProps)(ChatContainer);
