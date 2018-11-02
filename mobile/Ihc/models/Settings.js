/*
 * Whatever misc settings the app may need
 */
export default class Settings {
  // Insert any class methods here

}

Settings.schema = {
  name: 'Settings',
  properties: {
    'patientsLastSynced': 'int?', // timestamp
    'medicationsLastSynced': 'int?' //timestamp
  }
};
