// This file should handle all the fetch() calls to the Express server
// Requires Promises because dealing with server requests

import config from '../config.json';
import {convertPatientForServer, convertStatusForServer} from '../util/Realm';
// Must set the fetchUrl to the server's IP Address and Port
const fetchUrl = config.fetchUrl;

// Server endpoint: post /patient
export function createPatient(patient) {
  return fetch(fetchUrl + '/patient', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      patient: patient
    })
  }).then(response => response.json())
    .then(json => {
      // status is false if the Network connection went through but there was
      // some kind of error when processing the request.
      if (!json.status) {
        throw new Error(json.error);
      }

      return Promise.resolve(true);
    }).catch(err => {
      return Promise.reject(err);
    });
}

// Server endpoint: put /patient/:key/status/:date
export function updateStatus(statusObj) {
  const copy = convertStatusForServer(statusObj);
  return fetch(fetchUrl + `/patient/${statusObj.patientKey}/status/${statusObj.date}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: copy
    })
  }).then(response => response.json())
    .then(json => {
      // status is false if the Network connection went through but there was
      // some kind of error when processing the request. Throwing an error here
      // will lead to patient.needToUpload being marked as true
      if (!json.status) {
        throw new Error(json.error);
      }

      return Promise.resolve(true);
    }).catch(err => {
      return Promise.reject(err);
    });
}

// Server endpoint: put /patient/:key/drugUpdate/:date
export function updateDrugUpdate(update) {
  return fetch(fetchUrl + `/patient/${update.patientKey}/drugUpdate/${update.date}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      drugUpdate: update
    })
  }).then(response => response.json())
    .then(json => {
      if (!json.status) {
        throw new Error(json.error);
      }

      return Promise.resolve(true);
    }).catch(err => {
      return Promise.reject(err);
    });
}

// Server endpoint: get /patient/:key/drugUpdates
export function getDrugUpdates(patientKey) {
  return fetch(fetchUrl + '/patient/' + patientKey + '/drugUpdates')
    .then(response => response.json())
    .then(json => {
      if(json.error) {
        throw new Error(json.error);
      }
      const drugUpdates = json.drugUpdates;
      return Promise.resolve(drugUpdates);
    }).catch(err => {
      return Promise.reject(err);
    });
}

// Server endpoint: put /patient/:key/soap/:date
export function updateSoap(update) {
  //update is the new soap object
  return fetch(fetchUrl + `/patient/${update.patientKey}/soap/${update.date}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      soap: update
    })
  }).then(response => response.json())
    .then(json => {
      if (!json.status) {
        throw new Error(json.error);
      }

      return Promise.resolve(true);
    })
    .catch(err => {
      return Promise.reject(err);
    });
}

// Server endpoint: get /patient/:key/soap/:date
// Returns SOAP object if it exists, or undefined if not
export function getSoap(patientKey, strDate) {
  return fetch(fetchUrl + '/patient/' + patientKey +'/soap/' + strDate)
    .then(response => response.json())
    .then(json => {
      if (!json.status) {
        throw new Error(json.error);
      }

      return Promise.resolve(json.soap);
    })
    .catch(err => {
      return Promise.reject(err);
    });
}

// Server endpoint: put /patient/:key/triage/:date
export function updateTriage(update) {
  return fetch(fetchUrl + `/patient/${update.patientKey}/triage/${update.date}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      triage: update
    })
  })
    .then(response => response.json())
    .then(json => {
      if (!json.status) {
        throw new Error(json.error);
      }

      return Promise.resolve(true);
    })
    .catch(err => {
      return Promise.reject(err);
    });
}

// Server endpoint: get /patient/:key/triage/:date
// Returns Triage object if it exists, or undefined if not
export function getTriage(patientKey, strDate) {
  return fetch(fetchUrl + '/patient/' + patientKey + '/triage/' + strDate)
    .then(response => response.json())
    .then(json => {
      if (!json.status) {
        throw new Error(json.error);
      }

      return Promise.resolve(json.triage);
    })
    .catch(err => {
      return Promise.reject(err);
    });
}

// Server endpoint: get /patient/:key
export function getPatient(patientKey) {
  return fetch(fetchUrl + '/patient/' + patientKey)
    .then(response => response.json())
    .then(json => {
      if(json.error) {
        throw new Error(json.error);
      }
      const patient = json.patient;
      return Promise.resolve(patient);
    }).catch(err => {
      return Promise.reject(err);
    });
}

// Server endpoint: get /patients/statuses/:date
// Return the statuses of the patients that are for this date
export function getStatuses(strDate) {
  return fetch(fetchUrl + '/patients/statuses/' + strDate)
    .then(response => response.json())
    .then(json => {
      if(json.error) {
        throw new Error(json.error);
      }
      const statuses = json.patientStatuses;
      return Promise.resolve(statuses);
    }).catch(err => {
      return Promise.reject(err);
    });
}

// Server endpoint: post /patients
export function updatePatients(patients) {
  const patientsCopy = patients.map( patient => convertPatientForServer(patient) );
  return fetch(fetchUrl + '/patients/', {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      patients: patientsCopy
    }),
  }).then(() => {
    return Promise.resolve(true);
  }).catch(err => {
    return Promise.reject(err);
  });
}

export function updateMedications(medications) {
  return fetch(fetchUrl + '/medications/', {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      medications: medications
    }),
  }).then(() => {
    return Promise.resolve(true);
  }).catch(err => {
    return Promise.reject(err);
  });
}

// Server endpoint: get /patients/:timestamp
export function getUpdatedPatients(lastSynced) {
  return fetch(fetchUrl + '/patients/' + lastSynced)
    .then(response => response.json())
    .then(json => {
      if(json.error) {
        throw new Error(json.error);
      }
      const patients = json.patients;
      return Promise.resolve(patients);
    }).catch(err => {
      return Promise.reject(err);
    });
}

// Server endpoint: post /medication-inventory
export function createMedication(newMedication) {
  return fetch(fetchUrl + '/medication-inventory', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({medication: newMedication})
  }).then(response => response.json())
    .then(json => {
      if (!json.status) {
        throw new Error(json.error);
      }
      return Promise.resolve(true);
    })
    .catch(err => {
      return Promise.reject(err);
    });
}

// Server endpoint: get /medication-inventory/:name
export function getMedications(name) {
  return fetch(fetchUrl + '/medication-inventory/' + name)
    .then(response => response.json())
    .then(json => {
      if (!json.status) {
        throw new Error(json.error);
      }
      return Promise.resolve(json.medications);
    })
    .catch(err => {
      return Promise.reject(err);
    });
}

// Server endpoint: put /medication-inventory/:name/update/:date
// NOTE: separate update and create medication functions in order to check for pre-existing(create) and non-existing(update)
export function updateMedication(key, update) {
  return fetch(fetchUrl + '/medication-inventory/' + key + '/update', {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({medication: update})
  }).then(response => response.json())
    .then(json => {
      if (!json.status) {
        throw new Error(json.error);
      }
      return Promise.resolve(true);
    })
    .catch(err => {
      return Promise.reject(err);
    });
}

// Server endpoint: put /medication-inventory/:name/delete/:date
export function deleteMedication(key) {
  return fetch(fetchUrl + '/medication-inventory/' + key + '/delete', {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
  }).then(response => response.json())
    .then(json => {
      if (!json.status) {
        throw new Error(json.error);
      }
      return Promise.resolve(true);
    })
    .catch(err => {
      return Promise.reject(err);
    });
}

// Server endpoint: get /medications/:timestamp
export function getUpdatedMedications(lastSynced) {
  return fetch(fetchUrl + '/medications/' + lastSynced)
    .then(response => response.json())
    .then(json => {
      if(json.error) {
        throw new Error(json.error);
      }
      const medications = json.medications;
      return Promise.resolve(medications);
    }).catch(err => {
      return Promise.reject(err);
    });
}

export function checkCredentials(credentials) {
  return fetch(fetchUrl + '/credentials/check', {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      credentials: credentials
    })
  }).then(response => response.json())
    .then(json => {
      if(json.error) {
        throw new Error(json.error);
      }
      const status = json.status;
      if (status) {
        return Promise.resolve(true);
      } else {
        throw new Error('Access Denied');
      }
    }).catch(err => {
      return Promise.reject(err);
    });
}
