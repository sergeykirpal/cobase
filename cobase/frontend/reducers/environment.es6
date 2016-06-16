import * as types from 'constants/ActionTypes.es6';

const initialState = {
    mobileAppToken: null,
    mobileAppDeviceId: null,
    pageContentHeight: 0,
    topContentHeight: 0,
    height: 0,
    width: 0
};

export default function environment(state = initialState, action) {
    switch(action.type) {
        case types.ENVIRONMENT_SIZE_CHANGED:
            return Object.assign({}, state, {
                height: action.height,
                width: action.width,
                pageContentHeight: action.height - 75
            });

        case types.ENVIRONMENT_TOP_CONTENT_SIZE_CHANGED:
            return Object.assign({}, state, {
                topContentHeight: action.height
            });

        case types.ENVIRONMENT_MOBILEAPP_TOKEN_CHANGED:
            return Object.assign({}, state, {
                mobileAppToken: action.token
            });

        case types.ENVIRONMENT_MOBILEAPP_DEVICEID_CHANGED:
            return Object.assign({}, state, {
                mobileAppDeviceId: action.deviceId
            });

        default:
            return state;
    }
}
