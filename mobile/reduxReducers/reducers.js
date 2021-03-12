import {combineReducers} from 'redux';
import * as containerActions from '../reduxActions/containerActions';

// individual reducers have a function name that will equal their property name
// in the state object
// i.e. state.loading will become equal to whatever this function returns
// The state parameter represents the preexisting state, and should be returned
// if the action does not match.
// If the action does match, then return the new value that is passed within the
// action.
function loading(state = false, action) {
  switch (action.type) {
    case containerActions.SET_LOADING:
      return action.loading;
    default:
      return state;
  }
}

function uploading(state = false, action) {
  switch (action.type) {
    case containerActions.IS_UPLOADING:
      return action.uploading;
    default:
      return state;
  }
}

function showRetryButton(state = false, action) {
  switch (action.type) {
    case containerActions.SET_LOADING:
      return action.showRetryButton;
    default:
      return state;
  }
}

function messages(state = {successMessage: null, errorMessage: null}, action) {
  switch (action.type) {
    case containerActions.SET_SUCCESS_MESSAGE:
      return {successMessage: action.message, errorMessage: null};
    case containerActions.SET_ERROR_MESSAGE:
      return {errorMessage: action.message, successMessage: null};
    case containerActions.CLEAR_MESSAGES:
      return {successMessage: null, errorMessage: null};
    default:
      return state;
  }
}

function currentPatientKey(state = null, action) {
  switch (action.type) {
    case containerActions.SET_CURRENT_PATIENT_KEY:
      return action.currentPatientKey;
    default:
      return state;
  }
}

const reducers = combineReducers({
  loading,
  uploading,
  showRetryButton,
  messages,
  currentPatientKey
});

export default reducers;
