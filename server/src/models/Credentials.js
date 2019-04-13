import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const CredentialsSchema = Schema({
  userId: String,
  password: String,
  location: String
});
const CredentialsModel = mongoose.model('Credentials', CredentialsSchema);
module.exports = CredentialsModel;
