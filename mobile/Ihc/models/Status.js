import {stringDate} from '../util/Date';
import Patient from './Patient';
/*
 * A patient's status as they go through their appointment
 */
export default class Status {
  // Insert any class methods here

  static newStatus(patient) {
    const obj = {
      patientKey: patient.key,
      name: Patient.fullName(patient),
      birthday: patient.birthday,
      date: stringDate(new Date()),
      medicationCheckmarks: [],
      checkinTime: new Date().getTime(),
      lastUpdated: new Date().getTime(),
      checkedIn: true,
    };
    return obj;
  }
}

Status.schema = {
  name: 'Status',
  properties: {
    patientKey: 'string',
    name: 'string',
    birthday: 'string', // For convenience in patient select table
    date: 'string',
    checkinTime: 'int', // Timestamp, milliseconds
    triageCompleted: 'int?', // timestamp for when completed
    soapCompleted: 'int?',
    doctorCompleted: 'int?',
    pharmacyCompleted: 'int?',
    medicationCheckmarks: 'MedicationCheckmarks[]',
    notes: 'string?',
    lastUpdated: 'int',
    checkedIn: 'bool',
  }
};
