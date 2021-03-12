// Realm stores arrays as objects, so convert them before sending to server
export function convertPatientForServer(patient) {
  const copy = Object.assign({}, patient);
  copy.drugUpdates = Array.from(patient.drugUpdates);
  copy.soaps = Array.from(patient.soaps);
  copy.triages = Array.from(patient.triages);
  copy.statuses = Array.from(patient.statuses);
  return copy;
}

export function convertStatusForServer(statusObj) {
  const copy = Object.assign({}, statusObj);
  copy.medicationCheckmarks = Array.from(statusObj.medicationCheckmarks);
  return copy;
}
