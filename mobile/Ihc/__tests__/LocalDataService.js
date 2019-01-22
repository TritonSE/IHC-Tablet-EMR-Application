import sinon from 'sinon';
import {localData} from '../services/DataService';
import Realm, {mockObjects, mockCreate, mockWrite} from '../__mocks__/realm';

import Patient from '../models/Patient';
import Soap from '../models/Soap';
import DrugUpdate from '../models/DrugUpdate';
import Status from '../models/Status';
import Medication from '../models/Medication';

jest.mock('realm');

describe('Create patient', () => {
  beforeEach(() => {
    Realm.mockClear();
    mockObjects.mockClear();
    mockCreate.mockClear();
  });

  it('successfully creates a patient that didnt exist before', () => {
    // This createPatient() calls realm.objects(...).filtered(), so have to
    // return an object with a filtered function that returns the data we want
    mockObjects.mockImplementation(() => {
      return { filtered: () => { return {} }};
    });

    const now = new Date().getTime();
    // Makes the test use "now" as the timestamp whenever we call new
    // Date().getTime();
    sinon.useFakeTimers(now);

    const patient = Patient.getInstance();

    const expectedPatient = Patient.getInstance();
    expectedPatient.lastUpdated = now;
    const statusObj = Status.newStatus(expectedPatient);
    expectedPatient.statuses = [statusObj];

    localData.createPatient(patient);
    expect(mockCreate).toHaveBeenCalledWith('Patient', expectedPatient);
  });

  it('doesnt create a patient that did exist before', () => {
    mockObjects.mockImplementation(() => {
      return { filtered: () => { return { 0: Patient.getInstance() } }};
    });
    const now = new Date().getTime();
    sinon.useFakeTimers(now);

    const patient = Patient.getInstance();

    try{
      localData.createPatient(patient)
      throw new Error("Should have thrown an error");
    }
    catch(err) {
      expect(mockCreate).not.toHaveBeenCalled();
    }
  });
});

describe('Signin patient', () => {
  beforeEach(() => {
    Realm.mockClear();
    mockObjects.mockClear();
    mockCreate.mockClear();
  });

  it('successfully adds a Status object to the patient', () => {
    const patient = Patient.getInstance();

    mockObjects.mockImplementation(() => {
      return { filtered: () => { return { 0: patient } }};
    });

    const now = new Date().getTime();
    sinon.useFakeTimers(now);

    const statusObj = Status.newStatus(patient);

    // SigninPatient takes in the PatientForm info, aka their name and birthday,
    // so it will also work if we pass in the entire patient object
    localData.signinPatient(patient)
    expect(patient.statuses[0]).toEqual(statusObj);
  });
});

describe('Create medication', () => {
  beforeEach(() => {
    Realm.mockClear();
    mockObjects.mockClear();
    mockCreate.mockClear();
  });

  it('successfully creates a medication that didnt exist before', () => {
    mockObjects.mockImplementation(() => {
      return { filtered: () => { return {} } };
    });

    const now = new Date().getTime();
    sinon.useFakeTimers(now);

    const expectedMedication = Medication.getInstance();
    expectedMedication.lastUpdated = now;

    const medication = Medication.getInstance();
    localData.createMedication(medication);
    expect(mockCreate).toHaveBeenCalledWith('Medication', expectedMedication);
  });

  it('doesnt create a medication that did exist before', () => {
    mockObjects.mockImplementation(() => {
      return { filtered: () => { return { 0: Medication.getInstance() } }};
    });
    const now = new Date().getTime();
    sinon.useFakeTimers(now);

    const medication = Medication.getInstance();

    try{
      localData.createMedication(medication);
      throw new Error("Should have thrown an error");
    }
    catch(err) {
      expect(mockCreate).not.toHaveBeenCalled();
    }
  });
});

describe('Download updates', () => {
  beforeEach(() => {
    Realm.mockClear();
    mockObjects.mockClear();
    mockCreate.mockClear();
  });

  it('handles 0 medications when no prior settings exist', () => {
    mockObjects.mockImplementation(() => {
      // Return any object because no settings exist
      return {};
    });

    const now = new Date().getTime();
    sinon.useFakeTimers(now);

    const fails = localData.handleDownloadedMedications([]);
    expect(mockCreate).toHaveBeenCalledWith('Settings', {patientsLastSynced: 0, medicationsLastSynced: now});
    expect(fails).toEqual([]);
  });

  it('handles 0 medications when a prior settings exists', () => {
    // Just need to return a Settings object with any value
    const settings = { medicationsLastSynced: 100 };
    mockObjects.mockImplementation(() => {
      return { '0': settings};
    });

    const now = new Date().getTime();
    sinon.useFakeTimers(now);

    const fails = localData.handleDownloadedMedications([]);
    expect(mockCreate).not.toHaveBeenCalledWith('Settings', {patientsLastSynced: 0, medicationsLastSynced: now});
    expect(fails).toEqual([]);
  });

  it('handles 0 patients when no prior settings exist', () => {
    mockObjects.mockImplementation(() => {
      // Return any object because no settings exist
      return {};
    });

    const now = new Date().getTime();
    sinon.useFakeTimers(now);

    const fails = localData.handleDownloadedPatients([]);
    expect(mockCreate).toHaveBeenCalledWith('Settings', {patientsLastSynced: now, medicationsLastSynced: 0});
    expect(fails).toEqual([]);
  });

  it('handles 0 patients when a prior settings exists', () => {
    // Just need to return a Settings object with any value
    const settings = { patientsLastSynced: 100 };
    mockObjects.mockImplementation(() => {
      return { '0': settings };
    });

    const now = new Date().getTime();
    sinon.useFakeTimers(now);

    const fails = localData.handleDownloadedPatients([]);
    expect(mockCreate).not.toHaveBeenCalledWith('Settings', {patientsLastSynced: now, medicationsLastSynced: 0});
    expect(settings.patientsLastSynced).toEqual(now);
    expect(fails).toEqual([]);
  });

  it('handles 1 newer patient with new SOAP when a prior settings exists', () => {
    const now = new Date().getTime();

    const existingPatient = Patient.getInstance(now - 100);
    const incomingPatient = Patient.getInstance(now - 10);
    const soap = Soap.getInstance();
    incomingPatient.soaps = [soap];


    const settings = { patientsLastSynced: 100 };
    mockObjects.mockImplementation((type) => {
      if(type === 'Settings')
        return { '0': settings };
      else if(type === 'Patient') {
        const obj = {
          0: existingPatient,
        }
        return { filtered: () => obj };
      }
    });

    sinon.useFakeTimers(now);

    const fails = localData.handleDownloadedPatients([incomingPatient]);
    expect(mockWrite).toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalledWith('Settings', {patientsLastSynced: now, medicationsLastSynced: 0});
    expect(settings.patientsLastSynced).toEqual(now);
    expect(existingPatient).toEqual(incomingPatient);
    expect(fails).toEqual([]);
  });

  it('handles 1 newer patient with updated SOAP when no prior settings exists', () => {
    const now = new Date().getTime();

    const existingPatient = Patient.getInstance(now - 100);
    const incomingPatient = Patient.getInstance(now - 10);

    const existingSoap = Soap.getInstance();
    existingSoap.lastUpdated = now - 200;
    existingPatient.soaps = [existingSoap];

    const incomingSoap = Soap.getInstance();
    incomingSoap.lastUpdated = now - 50;
    incomingSoap.subjective = "Updated subjective";
    incomingPatient.soaps = [incomingSoap];

    mockObjects.mockImplementation((type) => {
      if(type === 'Settings')
        return {};
      else if(type === 'Patient') {
        const obj = {
          0: existingPatient,
        }
        return { filtered: () => obj };
      }
    });

    sinon.useFakeTimers(now);

    const fails = localData.handleDownloadedPatients([incomingPatient]);
    expect(mockWrite).toHaveBeenCalled();
    expect(mockCreate).toHaveBeenCalledWith('Settings', {patientsLastSynced: now, medicationsLastSynced: 0});
    expect(existingPatient).toEqual(incomingPatient);
    expect(fails).toEqual([]);
  });

  it('handles 1 newer patient with outdated SOAP when no prior settings exists', () => {
    const now = new Date().getTime();

    const existingPatient = Patient.getInstance(now - 100);
    const incomingPatient = Patient.getInstance(now - 10);

    const existingSoap = Soap.getInstance();
    existingSoap.lastUpdated = now - 200;
    existingPatient.soaps = [existingSoap];

    const incomingSoap = Soap.getInstance();
    incomingSoap.lastUpdated = now - 300;
    incomingSoap.subjective = "Updated subjective";
    incomingPatient.soaps = [incomingSoap];

    mockObjects.mockImplementation((type) => {
      if(type === 'Settings')
        return {};
      else if(type === 'Patient') {
        const obj = {
          0: existingPatient,
        }
        return { filtered: () => obj };
      }
    });

    sinon.useFakeTimers(now);

    const fails = localData.handleDownloadedPatients([incomingPatient]);
    expect(mockWrite).toHaveBeenCalled();
    expect(existingPatient).not.toEqual(incomingPatient);
    expect(fails).toEqual([incomingPatient.key]);
    // If didn't successfully update everything, then shouldn't update
    // lastSynced
    expect(mockCreate).not.toHaveBeenCalledWith('Settings', {patientsLastSynced: now, medicationsLastSynced: 0});
  });

  it('should not update 1 older patient with outdated SOAP when no prior settings exists', () => {
    const now = new Date().getTime();

    const existingPatient = Patient.getInstance(now - 100);
    const incomingPatient = Patient.getInstance(now - 1000);

    const existingSoap = Soap.getInstance();
    existingSoap.lastUpdated = now - 100;
    existingPatient.soaps = [existingSoap];

    // Has same timestamp as old soap so shouldnt trigger an update
    const incomingSoap = Soap.getInstance();
    incomingSoap.lastUpdated = now - 1000;
    incomingSoap.subjective = "Older subjective";
    incomingPatient.soaps = [incomingSoap];

    mockObjects.mockImplementation((type) => {
      if(type === 'Settings')
        return {};
      else if(type === 'Patient') {
        const obj = {
          0: existingPatient,
        }
        return { filtered: () => obj };
      }
    });

    sinon.useFakeTimers(now);

    try {
      localData.handleDownloadedPatients([incomingPatient]);
      expect(true).toEqual(false); // Should throw exception when getting an older patient
    } catch (e) {
      expect(existingPatient).not.toEqual(incomingPatient);
    }
  });

  it('handles 5 patients with multiple DrugUpdates when a prior settings exists, but 2 of the patients receive an outdated drug update', () => {
    const now = 1000;
    sinon.useFakeTimers(now);

    // 500 and 800 should not be updated because it is not more recent than 800
    const existingPatients = [850, 900, 950, 500, 600].map( timestamp => {
      const p = Patient.getInstance();
      p.key = "key&" + timestamp;

      const d = DrugUpdate.getInstance();
      d.frequency = "Updated freq";
      d.lastUpdated = 800;
      p.drugUpdates = [d];

      // Incoming patients should be updated if they have been updated more
      // recently than 800
      p.lastUpdated = 800;
      return p;
    });

    const incomingPatients = [850, 900, 950, 500, 600].map( timestamp => {
      const p = Patient.getInstance();
      p.key = "key&" + timestamp;

      const d = DrugUpdate.getInstance();
      d.frequency = "Updated freq";
      d.lastUpdated = timestamp;

      const d2 = DrugUpdate.getInstance();
      d2.name = "Advil";
      d2.frequency = "Updated duration";
      d2.lastUpdated = timestamp;
      p.drugUpdates = [d, d2];
      return p;
    });

    // Expected patients after function call
    // First three patients should be updated, last two shouldn't be
    const expectedPatients = [
      Object.assign({}, incomingPatients[0]),
      Object.assign({}, incomingPatients[1]),
      Object.assign({}, incomingPatients[2]),
      Object.assign({}, existingPatients[3]),
      Object.assign({}, existingPatients[4])
    ];

    const settings = { patientsLastSynced: 100 };
    let counter = 0; // number of types realm.objects('Patient') has been called
    mockObjects.mockImplementation((type) => {
      if(type === 'Settings')
        return { '0': settings };
      else if(type === 'Patient') {
        // Create object of { '0': patient1, ... } etc.
        const obj = { 0: existingPatients[counter] };
        counter++;

        return { filtered: () => obj };
      }
    });

    const fails = localData.handleDownloadedPatients(incomingPatients);
    expect(fails).toEqual(['key&500', 'key&600']);
    expect(mockWrite).toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalledWith('Settings', {patientsLastSynced: now, medicationsLastSynced: 0});
    expect(existingPatients).toEqual(expectedPatients);
    // lastSynced should not update because there are fails
    expect(settings.patientsLastSynced).toEqual(100);
  });
});
