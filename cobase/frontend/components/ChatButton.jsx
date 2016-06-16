import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';import {Link} from 'react-router'
import {isMobile} from 'utils/environment.es6'
import Loading from 'components/Loading.jsx'
import {changeLocation} from 'actions/site.es6'
import {getActiveProject} from 'actions/projects.es6'
import {pathMatch} from 'utils/url.es6'
import {ProjectsUrls, AuthUrls, ChatUrls} from 'constants/Urls.es6'
import {resetChatCounters} from 'actions/chat.es6'


class ChatButton extends Component {
    renderCounter(){
        var {user} = this.props

        if(!user.id){
            return
        }

        var data = user['chat']
        var directMessagesCount = data['new_direct_messages_count']
        var directMentionsCount = data['new_channel_mentions_count']
        var directChannelMessagesCount = data['new_channel_messages_count']

        if(directMessagesCount > 0 || directMentionsCount > 0){
            var totalCount = directMessagesCount + directMentionsCount
            return <span className="cobase-chat-btn-label dot" >{totalCount}</span>
        }else if(directChannelMessagesCount > 0){
            return <span className="cobase-chat-btn-label dot" ><span className="dotImg"> </span></span>
        }

    }

    onChatButton(event){
        var {dispatch, user, cid} = this.props
        if(isMobile('any')){
            event.preventDefault();
            var url = ChatUrls.chat
            if(cid)url += `?cid=${cid}`
            changeLocation(dispatch, url)
            return false
        }else{
            dispatch(resetChatCounters())
        }
        return true
    }

    render(){
        var {user, sessionId, cid} = this.props

        var url = `//chat.cobase.se?s=${sessionId}`
        if(cid)url += `&cid=${cid}`

        return  (
            <a target="_blank" onClick={this.onChatButton.bind(this)} href={url} className="cobase-chat-btn cobase-global-open-chat-btn" style={{display: 'block'}}>
                {this.renderCounter()}
                <i className="fa fa-comment"> </i>
            </a>
        )
    }
}

function mapStateToProps(state, props) {
    const {environment, auth, projects, routing} = state;
    var location = routing.locationBeforeTransitions
    var project = getActiveProject(projects)
    var user = auth.user
    var sessionId = ''
    var cid = null
    if(user.id){
        sessionId = user.session_id
    }
    if(project && pathMatch(location.pathname, `/project/${project.guid}`) && project.chat_channel_id){
        cid = project.chat_channel_id
    }

    return {
        environment,
        user,
        cid,
        sessionId
    };
}

export default connect(mapStateToProps)(ChatButton);
