import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const MedicationSchema = Schema({
  key: String,
  drugName: String,
  quantity: Number,
  dosage: Number,
  units: String,
  comments: String,
  lastUpdated: Number
});

const MedicationModel = mongoose.model('Medication', MedicationSchema);
module.exports = MedicationModel;
