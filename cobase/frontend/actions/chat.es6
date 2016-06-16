import * as types from 'constants/ActionTypes.es6';
import {ProjectsUrls, AuthUrls, ChatUrls} from 'constants/Urls.es6'
import {PUTRequest, POSTRequest, GETRequest} from 'utils/api.es6'
import * as config from 'constants/Config.es6';


export function resetChatCounters(){
    return function(dispatch, getState){
        var {auth} = getState()
        var user = auth.user
        PUTRequest(AuthUrls.api.userData(user.id), {jssid: '1234','chat_new_direct_messages': 0, 'chat_new_channel_messages': 0, 'chat_new_channel_mentions': 0})
    }
}