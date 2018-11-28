import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';

import { actionTypes } from 'app/store/actions';
import reducer from 'app/store/reducer';

export const initialState = {
    count: 0,
};

export function initializeStore(initialState = initialState) {
    return createStore(reducer, initialState, composeWithDevTools(applyMiddleware(thunkMiddleware)));
}