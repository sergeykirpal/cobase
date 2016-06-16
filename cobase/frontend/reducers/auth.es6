import * as types from '../constants/ActionTypes.es6';
import merge from 'lodash/object/merge';
import {User} from 'classes/auth.es6'

const initialState = {
    user: {},
    isUserFetching: false
};

export default function auth(previousState = initialState, action) {
    var user, companyUsers

    switch(action.type) {
        case types.AUTH_USER_RESPONSE:
            user = new User(Object.assign({}, previousState.user, action.user))
            return Object.assign({}, previousState, {user: user, isUserFetching: false})

        case types.AUTH_USER_REQUEST:
            return Object.assign({}, previousState, {isUserFetching: true})

        case types.AUTH_USER_UPDATED:
            user = new User(Object.assign({}, previousState.user, action.user))
            return Object.assign({}, previousState, {user: user})

        case types.AUTH_USER_COMPANY_USER_ADDED:
            companyUsers = previousState.user.companyusers
            if(!companyUsers){
                companyUsers = []
            }
            companyUsers = $.extend(true, [], previousState.user.companyusers)
            companyUsers.push(action.userLink)
            user = new User(Object.assign({}, previousState.user, {companyusers: companyUsers}))
            return Object.assign({}, previousState, {user: user})

        case types.AUTH_USER_COMPANY_USER_REMOVED:
            companyUsers = previousState.user.companyusers
            if(!companyUsers){
                companyUsers = []
            }
            companyUsers = $.extend(true, [], previousState.user.companyusers)

            var index = 0
            for(let userLink of companyUsers){
                if(userLink.id == action.userLink.id){
                    companyUsers.splice(index, 1)
                }
                index += 1
            }
            user = new User(Object.assign({}, previousState.user, {companyusers: companyUsers}))
            return Object.assign({}, previousState, {user: user})

        case types.AUTH_USER_RESET:
            return Object.assign({}, previousState, {user: {}})

        default:
            return previousState;
    }
}
