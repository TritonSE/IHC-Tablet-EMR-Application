import {localData, serverData} from '../services/DataService';

// Download updates from the server, save them locally, then resolve Promise
// of all the patient keys that failed to download
export function downstreamSyncWithServer() {
  const lastSynced = localData.patientsLastSynced();
  console.log("inside downstream");

  return serverData.getUpdatedPatients(lastSynced)
    .then((patients) => {
      console.log("Server Data fetch");
      const failedPatientKeys = localData.handleDownloadedPatients(patients);
      return {failedPatientKeys: failedPatientKeys};
    });
}

export function downloadMedications() {
  const lastSynced = localData.medicationsLastSynced();

  return serverData.getUpdatedMedications(lastSynced)
    .then((medications) => {
      const failedMedicationKeys = localData.handleDownloadedMedications(medications);
      return {failedMedicationKeys: failedMedicationKeys};
    });
}
export function downloadLabRequests() {
  const lastSynced = localData.labRequestsLastSynced();

  return serverData.getUpdatedLabRequests(lastSynced)
    .then((labRequests) => {
      const failedLabRequestKeys = localData.handleDownloadedLabRequests(labRequests);
      return {failedLabRequests : failedLabRequestKeys};
    });
}

export function downloadMedRequests() {
  const lastSynced = localData.medRequestsLastSynced();

  return serverData.getUpdatedMedRequests(lastSynced)
    .then((medRequests) => {
      const failedMedRequestKeys = localData.handleDownloadedMedRequests(medRequests);
      return {failedMedRequestKeys : failedMedRequestKeys};
    });
}
