import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const MedicationRequestSchema = Schema({
  key: String,
  patientKey: String,
  medicationRequested: [String],
  dateRequested: String,
  dateCompleted: String,
});

const MedicationRequestModel = mongoose.model('MedicationRequest', MedicationRequestSchema);
module.exports = MedicationRequestModel;

