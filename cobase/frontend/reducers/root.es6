import {combineReducers} from 'redux';
import environment from 'reducers/environment.es6';
import site from 'reducers/site.es6';
import auth from 'reducers/auth.es6';
import projects from 'reducers/projects.es6';
import {routerReducer} from 'react-router-redux'
import {reducer as modalReducer} from 'react-redux-modal'
import {reducer as notifications} from 'react-redux-notifications'
var {reducer: formReducer} = require('redux-form')


const rootReducer = combineReducers({
    environment,
    auth,
    projects,
    site,
    form: formReducer,
    notifications,
    routing: routerReducer,
    modals: modalReducer
});

export default rootReducer;
