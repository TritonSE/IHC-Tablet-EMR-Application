import mongoose from 'mongoose';

import MedicationCheckmarksModel from './MedicationCheckmarks';

const Schema = mongoose.Schema;
const StatusSchema = Schema({
  patientKey: String,
  name: String,
  birthday: String,
  date: String,
  checkinTime: Number, // timestamp, milliseconds
  triageCompleted: Number, // timestamps for when completed
  soapCompleted: Number,
  doctorCompleted: Number,
  pharmacyCompleted: Number,
  medicationCheckmarks: [MedicationCheckmarksModel.schema],
  notes: String,
  lastUpdated: Number // timestamp
});
const StatusModel = mongoose.model('Status', StatusSchema);
module.exports = StatusModel;
