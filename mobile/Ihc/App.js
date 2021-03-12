import React from 'react';

import { Navigation } from 'react-native-navigation';

import { registerScreens } from './screens';
import config from './config.json';

import {
    Image,
} from 'react-native';

import { createStore } from 'redux';
import reducers from './reduxReducers/reducers';
import { Provider } from 'react-redux';
import SyncStorage from 'sync-storage';

const store = createStore(reducers);

registerScreens(store, Provider); // this is where you register all of your app's screens

SyncStorage.init().then(() => {
    const fetchUrl = SyncStorage.get('@ihc:fetchUrl');
    console.log("CHECKING FETCH URL APP.JS");
    console.log(fetchUrl);
    if (fetchUrl == null) {
        return SyncStorage.set('@ihc:fetchUrl', config.fetchUrl);
    } else {
        return new Promise((resolve, reject) => { resolve(); });
    }
}).then(() => {
    if (config.testingServerDataService === 'true') {
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
                screen: 'Ihc.WelcomeScreen',
                title: 'Welcome',
                navigatorStyle: {},
                navigatorButtons: {}
            },
            passProps: {},
            animationType: 'slide-down'
        });
    }
}).catch(err => {
    console.log(err);
})

