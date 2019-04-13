import { Navigation } from 'react-native-navigation';

import { registerScreens } from './screens';
import config from './config.json';

import { createStore } from 'redux';
import reducers from './reduxReducers/reducers';
import { Provider } from 'react-redux';

const store = createStore(reducers);

registerScreens(store, Provider); // this is where you register all of your app's screens

if (config.testingServerDataService === 'true' ) {
  // Test server data service with buttons that call service
  Navigation.startSingleScreenApp({
    screen: {
      screen: 'Ihc.TestServerScreen',
      title: 'Test',
      navigatorStyle: {},
      navigatorButtons: {}
    },
    passProps: {},
    animationType: 'slide-down'
  });
} else {
  // start the app
  Navigation.startSingleScreenApp({
    screen: {
      screen: 'Ihc.LoginScreen',
      title: 'Welcome',
      navigatorStyle: {},
      navigatorButtons: {}
    },
    passProps: {},
    animationType: 'slide-down'
  });
}
