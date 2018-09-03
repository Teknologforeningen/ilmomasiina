import request from 'then-request';

// ------------------------------------
// Constants
// ------------------------------------
export const UPDATE_EVENT = 'UPDATE_EVENT';
export const UPDATE_SIGNUP = 'UPDATE_SIGNUP';
export const SET_LOADING = 'SET_LOADING';
export const SET_ERROR = 'SET_ERROR';

// ------------------------------------
// Actions
// ------------------------------------

// Helpers
function _getEvent(id) {
  return request('GET', `/api/events/${id}`);
}

function _attachPosition(quotaId) {
  return request('POST', '/api/signups', { json: { quotaId } });
}

function _insertAnswers(signupId, data) {
  return request('PATCH', `/api/signups/${signupId}`, {
    json: {
      editToken: data.editToken,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      answers: data.answers,
    },
  });
}

function _deleteSignup(signupId, editToken) {
  return request('DELETE', `/api/signups/${signupId}?editToken=${editToken}`);
}

/*  This is a thunk, meaning it is a function that immediately
    returns a function for lazy evaluation. It is incredibly useful for
    creating async actions, especially when combined with redux-thunk! */

export const setLoading = isLoading => (dispatch) => {
  dispatch({
    type: SET_LOADING,
    payload: isLoading,
  });
};

// If non-empty string, counts as error
export const setError = errorText => (dispatch) => {
  dispatch({
    type: SET_ERROR,
    payload: errorText,
  });
};

export const updateEventAsync = eventId => (dispatch) => {
  _getEvent(eventId)
    .then(res => JSON.parse(res.body))
    .then((res) => {
      dispatch({
        type: UPDATE_EVENT,
        payload: res,
      });
    });
};

export const attachPositionAsync = quotaId => (dispatch) => {
  _attachPosition(quotaId)
    .then(res => JSON.parse(res.body))
    .then((res) => {
      dispatch({
        type: UPDATE_SIGNUP,
        payload: res,
      });
    });
};

export const completeSignupAsync = (signupId, data) => (dispatch) => {
  dispatch(setLoading(true));

  return _insertAnswers(signupId, data)
    .then(res => JSON.parse(res.body))
    .then((res) => {
      dispatch({
        type: UPDATE_SIGNUP,
        payload: res,
      });
      dispatch(setLoading(false));
      return true;
    })
    .catch(() => {
      dispatch(setError('Jotain meni pieleen. Yritä uudelleen.'));
      return false;
    });
};

export const cancelSignupAsync = (signupId, editToken) => dispatch =>
  _deleteSignup(signupId, editToken)
    .then(res => JSON.parse(res.body))
    .then(() => {
      dispatch({
        type: UPDATE_SIGNUP,
        payload: {},
      });
      dispatch(setLoading(false));
    });

export const actions = {
  updateEventAsync,
  attachPositionAsync,
  completeSignupAsync,
  cancelSignupAsync,
  setLoading,
  setError,
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const initialState = {
  event: {},
  signup: {},
  loading: false,
  error: '',
};

const ACTION_HANDLERS = {
  [UPDATE_EVENT]: (state, action) => ({
    ...state,
    event: action.payload,
  }),
  [UPDATE_SIGNUP]: (state, action) => ({
    ...state,
    signup: action.payload,
  }),
  [SET_LOADING]: (state, action) => ({
    ...state,
    loading: action.payload,
    error: '',
  }),
  [SET_ERROR]: (state, action) => ({
    ...state,
    error: action.payload,
    loading: false,
  }),
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function counterReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}
