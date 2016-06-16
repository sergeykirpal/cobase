import * as types from '../constants/ActionTypes.es6';
import merge from 'lodash/object/merge';

const initialState = {
    language: null,
    title: null,
    serverEvent: {},
    backButtonVisible: false,
    scrollBoxes: {}
};

export default function site(previousState = initialState, action) {
    switch(action.type) {
        case types.SITE_LANGUAGE_SET:
            return Object.assign({}, previousState, {language: action.language})

        case types.SITE_TITLE_CHANGED:
            return Object.assign({}, previousState, {title: action.title})

        case types.SITE_SCROLLBOX_POSITION_CHANGED:
            return Object.assign({}, previousState, {scrollBoxes: Object.assign({}, previousState.scrollBoxes, {[action.box]: action.scrollPos})})

        case types.SITE_BACK_BUTTON_TOGGLE:
            return Object.assign({}, previousState, {backButtonVisible: action.visible})

        case types.SITE_SERVER_EVENT:
            return Object.assign({}, previousState, {serverEvent: {event: action.event, data: action.data, time: action.time}})

        default:
            return previousState;
    }
}
