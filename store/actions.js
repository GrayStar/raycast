export const actionTypes = {
    INCREMENT: 'INCREMENT',
};

export const incrementCount = (isServer) => dispatch => {
    return dispatch({ type: actionTypes.INCREMENT });
}