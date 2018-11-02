import {localData, serverData} from '../services/DataService';

// Download updates from the server, save them locally, then resolve Promise
// of all the patient keys that failed to download
export function downstreamSyncWithServer() {
  const lastSynced = localData.patientsLastSynced();

  return serverData.getUpdatedPatients(lastSynced)
    .then((patients) => {
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
