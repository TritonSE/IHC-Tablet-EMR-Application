import {stringDate} from '../util/Date';
export default class MedicationRequest {
  static makeKey(medicationRequest) {
    const str = `${medicationRequest.patientKey}&${medicationRequest.dateRequested}`;
    return str;
  }

  static newMedicationRequest(patientKey, medicationRequested) {
    const obj = {
      patientKey: patientKey,
      medicationRequested: medicationRequested,
      dateRequested: stringDate(new Date()),
      dateCompleted: null
    };
    obj.key = this.makeKey(obj);
    return obj;
  }
}

MedicationRequest.schema = {
  name: 'MedicationRequest',
  properties: {
    key: 'string',
    patientKey: 'string?',
    medicationRequested: {type: 'string[]'},
    dateRequested: 'string?',
    dateCompleted: 'string?',
  }
};

