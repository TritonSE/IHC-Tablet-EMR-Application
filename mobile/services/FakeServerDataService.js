/* eslint-disable */
// This file should hold skeletons for the function calls from RealDataService.
// Implementation is not required because they should be stubbed out during
// tests

export function createPatient(patient) {
  return new Promise((res,rej) => {
    setTimeout(() => {
      res(true);
      // rej(new Error("Fake error in FakeServerDataService"));
    }, 500);
  });
}

export function updateStatus(statusObj) {
  return new Promise((res,rej) => {
    setTimeout(() => {
      res(true);
    }, 500);
  });
}

// Server endpoint: put /patient/:key/drugUpdate
export function updateDrugUpdate(update) {
  return new Promise((res,rej) => {
    setTimeout(() => {
      res(true);
    }, 500);
  });
}

// Server endpoint: put /patient/:key/soap/:date
export function updateSoap(update) {
  return new Promise((res,rej) => {
    setTimeout(() => {
      res(true);
    }, 500);
  });
}

// Server endpoint: get /patient/:key/soap/:date
// Returns SOAP object if it exists, or undefined if not
export function getSoap(patientKey, strDate) {
}

// Server endpoint: put /patient/:key/triage/:date
export function updateTriage(update) {
  return new Promise((res,rej) => {
    setTimeout(() => {
      res(true);
    }, 500);
  });
}

// Server endpoint: get /patient/:key/triage/:date
// Returns Triage object if it exists, or undefined if not
export function getTriage(patientKey, strDate) {
}

// Server endpoint: get /patient/:key
export function getPatient(patientKey) {
}

// Server endpoint: get /patient/:key/drugUpdates
export function getMedicationUpdates(patientKey) {
}

// Server endpoint: get /patients/statuses/:date
// Return the statuses of the patients that are active and for this date
export function getActiveStatuses() {
}

// Server endpoint: post /patients
export function updatePatients(patients) {
  return new Promise((res,rej) => {
    setTimeout(() => {
      res(true);
    }, 500);
  });
}

// Server endpoint: get /patients/:timestamp
export function getUpdatedPatients(lastSynced) {
  return new Promise((res,rej) => {
    setTimeout(() => {
      res([]);
    }, 500);
  });
}

export function getUpdatedLabRequests(lastSynced) {
  return new Promise((res,rej) => {
    setTimeout(() => {
      res([]);
    }, 500);
  });
}

export function getUpdatedMedications(lastSynced) {
  return new Promise((res,rej) => {
    setTimeout(() => {
      res([]);
    }, 500);
  });
}
/* eslint-enable */
