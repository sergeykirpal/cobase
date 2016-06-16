import * as types from 'constants/ActionTypes.es6';
import {arrayOf, normalize} from 'normalizr';
import {AuthUrls} from 'constants/Urls.es6'
import {queryString} from 'utils/url.es6'
import {PUTRequest, POSTRequest, GETRequest} from 'utils/api.es6'
import {updateMobileAppBadge} from 'actions/environment.es6'


export function fetchUserIfNeed(fields, callback=null){
    return (dispatch, getState) => {
        var {auth} = getState()
        var user = auth.user
        var needFetch = false
        if(!auth.isUserFetching){
            if(!user.id){
                needFetch = true
            }else{
                for(let field of fields){
                    if(typeof user[field] == 'undefined'){
                        needFetch = true
                    }
                }
            }
            if(!needFetch){
                if(typeof callback == 'function'){
                    callback(user)
                }
            }

        }

        if(needFetch){
            dispatch(fetchUser({fields:fields.join(',')}, callback))
        }
    }
}

export function fetchUser(params, callback=null){
    return (dispatch, getState) => {
        dispatch(fetchUserRequest())
        var url = AuthUrls.api.currentUser
        return GETRequest(url, params, function(response){
            dispatch(fetchUserResponse(response))
            dispatch(updateMobileAppBadge())
            if(typeof callback == 'function'){
                callback(response)
            }
        })
    }
}

export function fetchUserRequest() {
    return {
        type: types.AUTH_USER_REQUEST
    }
}

export function fetchUserResponse(user) {
    return {
        type: types.AUTH_USER_RESPONSE,
        user
    }
}

export function userUpdated(user) {
    return {
        type: types.AUTH_USER_UPDATED,
        user
    }
}

export function resetUser() {
    return {
        type: types.AUTH_USER_RESET,
    }
}

export function companyUserAdded(userLink){
    return {
        type: types.AUTH_USER_COMPANY_USER_ADDED,
        userLink
    }
}

export function companyUserRemoved(userLink){
    return {
        type: types.AUTH_USER_COMPANY_USER_REMOVED,
        userLink
    }
}