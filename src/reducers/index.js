import { combineReducers } from 'redux';
import appState from './appState';
import garageState from './garagesState';

const rootReducer = combineReducers({ appState, garageState });

export default rootReducer;