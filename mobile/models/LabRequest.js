export default class LabRequest {

  static makeKey(labRequest) {
    const str = `${labRequest.patientKey}&${labRequest.testType}${labRequest.dateRequested}`;
    return str;
  }

  // create lab request of tests passed from form
  static extractFromForm(form, patientKey) {
    const labRequests = [];

    const requestedTests = Object.assign({}, form);
    const currentTime = new Date().getTime();

    Object.entries(requestedTests).forEach(test => {
      const labRequest = {};
      labRequest.patientKey = patientKey;
      labRequest.testType = test;
      labRequest.dateRequested = new Date();
      labRequest.dateCompleted = null;
      labRequest.key = this.makeKey(labRequest);
      labRequest.lastUpdated = currentTime;
      labRequests.push(labRequest);
    });

    return labRequests;
  }
}

LabRequest.schema = {
  name: 'LabRequest',
  properties: {
    key: 'string',
    patientKey: 'string',
    testType: 'string',
    dateRequested: 'string',
    dateCompleted: 'string',
    lastUpdated: 'int',
    needToUpload: 'bool?',
  }
};
