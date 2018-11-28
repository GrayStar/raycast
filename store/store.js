import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';

const initialState = {
    count: 0,
};

export const actionTypes = {
    INCREMENT: 'INCREMENT',
};

// REDUCERS
export const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.INCREMENT:
            return Object.assign({}, state, {
                count: state.count + 1
            });
            break;
        default:
            return state;
    }
}

// ACTIONS
export const incrementCount = (isServer) => dispatch => {
    console.log('action fired for incrementCount');
    return dispatch({ type: actionTypes.INCREMENT });
}

export function initializeStore(initialState = initialState) {
    return createStore(reducer, initialState, composeWithDevTools(applyMiddleware(thunkMiddleware)));
}