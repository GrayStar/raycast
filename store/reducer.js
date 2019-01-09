import { initialState } from 'app/store/store';
import { actionTypes } from 'app/store/actions';

export default (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.INCREMENT:
            return Object.assign({}, state, {
                count: state.count + 1,
            });
            break;
        default:
            return state;
    }
}