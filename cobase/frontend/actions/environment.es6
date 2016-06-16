import * as types from 'constants/ActionTypes.es6';
import {MobileAppUrls} from 'constants/Urls.es6'
import {PUTRequest, POSTRequest, GETRequest, DELETERequest} from 'utils/api.es6'
import {integerGuid, uuid} from 'utils/string.es6'
import {changeLocation} from 'actions/site.es6'
import {resetActiveProject} from 'actions/projects.es6'
import {resetUser} from 'actions/auth.es6'


export function environmentSizeChanged(height, width) {
    return {
        type: types.ENVIRONMENT_SIZE_CHANGED,
        height,
        width
    };
}

export function topContentSizeChanged(height) {
    return {
        type: types.ENVIRONMENT_TOP_CONTENT_SIZE_CHANGED,
        height
    };
}

export function mobileAppTokenChanged(token){
    return {
        type: types.ENVIRONMENT_MOBILEAPP_TOKEN_CHANGED,
        token
    }
}

export function mobileAppDeviceIdChanged(deviceId){
    return {
        type: types.ENVIRONMENT_MOBILEAPP_DEVICEID_CHANGED,
        deviceId
    }
}

export function setMobileAppDeviceIdIfNeed(deviceId){
    return function(dispatch, getState){
        var {environment} = getState()
        var mobileAppDeviceId = environment.mobileAppDeviceId
        if(!mobileAppDeviceId || deviceId != mobileAppDeviceId){
            $.cookie('device_id', deviceId, {expires: 365 * 10, path: '/'})
            dispatch(mobileAppDeviceIdChanged(deviceId))
        }
    }
}

export function genMobileAppDeviceId(service){
    return service == 'gcm' ? integerGuid() : uuid()
}

export function registerMobileAppDevice(token){
    return function(dispatch, getState){
        var {environment} = getState()
        var deviceId = environment.mobileAppDeviceId ? environment.mobileAppDeviceId : genMobileAppDeviceId(token.service)
        POSTRequest(MobileAppUrls.api.device, {registration_id: token.id, service: token.service, device_id:deviceId}, function(device){
            dispatch(setMobileAppDeviceIdIfNeed(device.device_id))
            if(device.active != 1){
                Bridge.unregisterToken(function (err) {
                    Bridge.registerToken(function (err, newToken) {
                        if(newToken && newToken.id){
                            dispatch(mobileAppTokenChanged(newToken))
                            POSTRequest(MobileAppUrls.api.device, {registration_id: newToken.id, service: newToken.service, device_id:deviceId}, function (device) {
                                dispatch(setMobileAppDeviceIdIfNeed(device.device_id))
                            })
                        }
                    });
                });
            }
        })
    }
}

export function initEnvironment() {
    return dispatch => {
        dispatch(environmentSizeChanged(window.innerHeight, window.innerWidth));
        window.onresize = () => {
            dispatch(environmentSizeChanged(window.innerHeight, window.innerWidth));
        }

        dispatch(mobileAppDeviceIdChanged($.cookie('device_id')));

        Bridge.load(function() {
            Bridge.getToken(function(error, token){
                if(token && token.id){
                    if(token && token.id){
                        //var token = {service: 'gcm', id: 'A0PA91bHLqWig63PyE0gyxpGabniLnR0y8lUywMwI0k'}
                        dispatch(mobileAppTokenChanged(token));
                        dispatch(registerMobileAppDevice(token))
                    }
                }
            })
        })

        Bridge.listener = function (payload, fromForeground) {
            if(payload['url'] && payload['url'].length > 0){
                var type = payload['type']
                if(type == 'new_task' || !fromForeground){
                    changeLocation(dispatch, payload['url'])
                }
            }
        };
    };
}

export function updateMobileAppBadge() {
    return function(dispatch, getState){
        var {auth} = getState()
        var user = auth.user
        if(user.id && user['projectstasks']){
            var number = user['projectstasks']['all']['total']['recent_count']
            Bridge.setBadgeNumber(number)
        }
    }
}