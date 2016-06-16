import {createStore, applyMiddleware, compose} from 'redux';
import thunkMiddleware from 'redux-thunk';
import rootReducer from 'reducers/root.es6';
import {routerMiddleware} from 'react-router-redux'
import {browserHistory} from 'react-router'
const reactRouterMiddleware = routerMiddleware(window.appHistory)

var createStoreWithMiddleware = compose(
    applyMiddleware(thunkMiddleware),
    typeof window === 'object' && typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f,
    applyMiddleware(reactRouterMiddleware)
)(createStore);

export default function configureStore(initialState) {
    const store = createStoreWithMiddleware(rootReducer, initialState);
    return store;
}
