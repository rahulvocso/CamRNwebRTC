/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

import notifee, {AndroidImportance} from '@notifee/react-native'; //added later

AppRegistry.registerComponent(appName, () => App);

// added later
notifee.registerForegroundService(notification => {
  return new Promise(() => {});
});
