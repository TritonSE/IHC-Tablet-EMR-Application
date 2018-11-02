export default class Medication {
  //for testing purposes
  static getInstance(drugName = 'ibuprofen', quantity = 500, dosage = 200, units = 'mg',
                    key = 'ibuprofen&200mg', lastUpdated = new Date().getTime()) {
    return {drugName, quantity, dosage, units, key, lastUpdated};
  }

  static makeKey(medication) {
    const str = `${medication.drugName}&${medication.dosage}${medication.units}`;
    return str;
  }

  static extractFromForm(form) {
    const medication = Object.assign({}, form);
    medication.key = Medication.makeKey(medication);
    medication.lastUpdated = new Date().getTime();
    return medication;
  }

}

Medication.schema = {
  name: 'Medication',
  properties: {
    //TODO: maybe have a category property (i.e. painkillers, antibiotics, dietary supplements, etc)
    //      mainly so that you can search for all drugs in a certain category
    key: 'string',
    drugName: 'string',
    quantity: 'int',
    dosage: 'int',
    units: 'string',
    comments: 'string?', //Consider keeping track of multiple comments (array of strings)
    lastUpdated: 'int',
    needToUpload: 'bool?',
  }
};
