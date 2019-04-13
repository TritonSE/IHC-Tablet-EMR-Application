import CredentialsModel from '../models/Credentials';

const ApplicationController = {

  AuthorizationCheck: function(req, res) {
    CredentialsModel.findOne({userId: req.body.credentials.userId,
                              password: req.body.credentials.password}, function(err, credentials) {
      if (!credentials) {
        err = new Error('No credentials exist for the given userId and password');
      } else {
        if (credentials.location !== req.body.credentials.location) {
          err = new Error('Wrong location');
        }
      }
      if (err) {
        res.json({status: false, error: err.message});
        return;
      }
      res.json({status: true});
      return;
    });
  },

  AddCredentials: function(req, res) {
    CredentialsModel.findOne({userId: req.body.credentials.userId,
                              password: req.body.credentials.password,
                              location: req.body.credentials.location}, function(err, credentials) {
      if (credentials) {
        err = new Error('Credentials for the given login already exists for this location');
      }
      if (err) {
        res.json({status: false, error: err.message});
        return;
      }
      CredentialsModel.create(req.body.credentials, function(err) {
        if(err) {
          res.json({status: false, error: err.message});
          return;
        }
        res.json({status: true});
        return;
      });
    });
  }
};

module.exports = ApplicationController;
