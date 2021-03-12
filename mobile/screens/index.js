import { Navigation } from 'react-native-navigation';

import SigninScreen from './SigninScreen';
import WelcomeScreen from './WelcomeScreen';
import TriagePageNew from './TriagePageNew';
import MedicationScreen from './MedicationScreen';
import MedicationUpdateScreen from './MedicationUpdateScreen';
import GrowthChartScreen from './GrowthChartScreen';
import SoapScreen from './SoapScreen';
import TriageScreen from './TriageScreen';
import TriageHistory from './TriageHistory';
import TestServerScreen from './TestServerScreen';
import MedicationInventoryScreen from './MedicationInventoryScreen';
import LoginScreen from './LoginScreen';
import PatientHomeScreen from './PatientHomeScreen';
import LabRequestScreen from './LabRequestScreen';
import MedicationRequestScreen from './MedicationRequestScreen';
import MedicationFilloutScreen from './MedicationFilloutScreen';
import SettingsScreen from './SettingsScreen';

import PatientList from './PatientList.js';
import PatientCheckIn from './PatientCheckIn.js';
import LabFilloutScreen from './LabFilloutScreen.js';


// register all screens of the app (including internal ones)
// store and Provider are pieces of Redux
export function registerScreens(store, Provider) {

  // All ID names should be Ihc.<Component Name>
  Navigation.registerComponent('Ihc.WelcomeScreen', () => WelcomeScreen, store, Provider);
  Navigation.registerComponent('Ihc.SigninScreen', () => SigninScreen, store, Provider);
  Navigation.registerComponent('Ihc.PatientSelectScreen', () => PatientSelectScreen, store, Provider);
  Navigation.registerComponent('Ihc.PatientHomeScreen', () => PatientHomeScreen, store, Provider);
  Navigation.registerComponent('Ihc.MedicationScreen', () => MedicationScreen, store, Provider);
  Navigation.registerComponent('Ihc.GrowthChartScreen', () => GrowthChartScreen, store, Provider);
  Navigation.registerComponent('Ihc.MedicationUpdateScreen', () => MedicationUpdateScreen, store, Provider);
  Navigation.registerComponent('Ihc.SoapScreen', () => SoapScreen, store, Provider);
  Navigation.registerComponent('Ihc.TriageScreen', () => TriageScreen, store, Provider);
  Navigation.registerComponent('Ihc.TriageHistory', () => TriageHistory, store, Provider);
  Navigation.registerComponent('Ihc.PatientHistoryScreen', () => PatientHistoryScreen, store, Provider);
  Navigation.registerComponent('Ihc.TestServerScreen', () => TestServerScreen);
  Navigation.registerComponent('Ihc.MedicationInventoryScreen', () => MedicationInventoryScreen, store, Provider);
  Navigation.registerComponent('Ihc.LoginScreen', () => LoginScreen, store, Provider);
  Navigation.registerComponent('Ihc.PatientList', () => PatientList, store, Provider);
  Navigation.registerComponent('Ihc.LabRequestScreen', () => LabRequestScreen, store, Provider);
  Navigation.registerComponent('Ihc.PatientCheckIn', () => PatientCheckIn, store, Provider);
  Navigation.registerComponent('Ihc.LabFilloutScreen', () => LabFilloutScreen, store, Provider);
  Navigation.registerComponent('Ihc.MedicationRequestScreen', () => MedicationRequestScreen, store, Provider);
  Navigation.registerComponent('Ihc.MedicationFilloutScreen', () => MedicationFilloutScreen, store, Provider);
  Navigation.registerComponent('Ihc.SettingsScreen', () => SettingsScreen, store, Provider);
}
