export default class Soap {
  // Insert any class methods here

  static extractFromForm(form, patientKey) {
    const soap = Object.assign({}, form);
    soap.patientKey = patientKey;
    soap.lastUpdated = new Date().getTime();
    return soap;
  }

  // Can pass in parameters to override defaults, mostly useful for tests
  static getInstance(patientKey = 'firstname&father&mother&20000101',
    date = '20180101', subjective = 'subjective', objective = 'objective',
    assessment = 'assessment', plan = 'plan', wishlist = 'wishlist', provider = 'doc',
    lastUpdated = new Date().getTime()) {
    return {
      patientKey, date, subjective, objective, assessment, plan, wishlist, provider, lastUpdated
    };
  }
}

Soap.schema = {
  name: 'Soap',
  properties: {
    patientKey: 'string',
    date: 'string',
    subjective: 'string?',
    objective: 'string?',
    assessment: 'string?',
    plan: 'string?',
    wishlist: 'string?',
    provider: 'string', // Doctor's name
    lastUpdated: 'int',
  }
};
