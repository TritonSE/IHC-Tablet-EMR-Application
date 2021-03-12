import {stringDate} from '../util/Date';
export default class MedicationCheckmarks {
  // Insert any class methods here

  static newMedicationCheckmarks(patientKey, drugName) {
    const obj = {
      patientKey: patientKey,
      drugName: drugName,
      date: stringDate(new Date()),
      taking: false,
      notTaking: false,
      incorrectly: false,
      lastUpdated: new Date().getTime(),
    };
    return obj;
  }
}

MedicationCheckmarks.schema = {
  name: 'MedicationCheckmarks',
  properties: {
    patientKey: 'string',
    drugName: 'string',
    date: 'string',
    taking: 'bool?',
    notTaking: 'bool?',
    incorrectly: 'bool?',
    lastUpdated: 'int',
  }
};
