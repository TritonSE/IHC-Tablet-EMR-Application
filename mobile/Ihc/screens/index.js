import { Navigation } from 'react-native-navigation';

import WelcomeScreen from './WelcomeScreen';
import SigninScreen from './SigninScreen';
import PatientSelectScreen from './PatientSelectScreen';
import PatientHomeScreen from './PatientHomeScreen';
import MedicationScreen from './MedicationScreen';
import MedicationUpdateScreen from './MedicationUpdateScreen';
import GrowthChartScreen from './GrowthChartScreen';
import SoapScreen from './SoapScreen';
import TriageScreen from './TriageScreen';
import PatientHistoryScreen from './PatientHistoryScreen';
import TestServerScreen from './TestServerScreen';
import MedicationInventoryScreen from './MedicationInventoryScreen';

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
  Navigation.registerComponent('Ihc.PatientHistoryScreen', () => PatientHistoryScreen, store, Provider);
  Navigation.registerComponent('Ihc.TestServerScreen', () => TestServerScreen);
  Navigation.registerComponent('Ihc.MedicationInventoryScreen', () => MedicationInventoryScreen);
}
