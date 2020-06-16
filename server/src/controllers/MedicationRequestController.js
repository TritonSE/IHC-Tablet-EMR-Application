import MedicationRequestModel from '../models/MedicationRequest';

const MedicationRequestController = {

  AddToQueue: function(req, res) {
    MedicationRequestModel.findOne({patientKey: req.body.medRequest.patientKey, testType: req.body.medRequest.testType}, function(err, medRequest) {
      if (medRequest) {
        err = new Error(`A medication request for patient ${req.body.medRequest.patientKey} was already enqueued`);
      }
      if (err) {
        res.json({status: false, error: err.message});
        return;
      }
      MedicationRequestModel.create(req.body.medRequest, function(err) {
        if (err) {
          res.json({status: false, error: err.message});
          return;
        }
        res.json({status: true});
        return;
      });
    });
  },

  RemoveFromQueue: function(req, res) {
    MedicationRequestModel.deleteMany({patientKey: req.body.medRequest.patientKey, key: req.body.medRequest.key}, function(err, medRequest) {
      if (!medRequest) {
        err = new Error(`A medication request for patient ${req.body.medRequest.patientKey} does not exist in the queue`);
      }
      if (err) {
        res.json({status: false, error: err.message});
        return;
      }
      res.json({status: true});
      return;
    });
  },

  GetUpdatedMedRequests: function(req, res) {
    const timestamp = parseInt(req.params.lastUpdated);
    // couldn't convert properly
    if(isNaN(timestamp)) {
      res.json({status:false, error: 'Error converting lastUpdated to int'});
      return;
    }

    MedicationRequestModel.find({ dateRequested: {$gt: timestamp} },function(err, medRequests){
      if(err){
        res.json({status:false, error: err.message});
        return;
      }
      res.json({status: true, medRequests: medRequests});
    });
  },

  /*
  ClearQueue: function(req, res) {
    MedicationRequestModel.deleteMany({}, function(err, medRequest) {
      if (err) {
        res.json({status: false, error: err.message});
        return;
      }
      res.json({status: true});
      return;
    });
  },

  MarkComplete: function(req, res) {
    MedicationRequestModel.findOne({key: req.params.key}, function(err, medRequest) {
      if (!medRequest) {
        err = new Error(`The medRequest request ${req.params.key} does not exist in the queue`);
      }
      if (err) {
        res.json({status: false, error: err.message});
        return;
      }

      medRequest.dateCompleted = new Date();
      medRequest.save(function(err) {
        if(err) {
          res.json({status: false, error: err.message});
          return;
        }
        res.json({status: true});
        return;
      });
    });
  },

  MarkIncomplete: function(req, res) {
    MedicationRequestModel.findOne({key: req.params.key}, function(err, medRequest) {
      if (!medRequest) {
        err = new Error(`The medRequest request ${req.params.key} does not exist in the queue`);
      }
      if (err) {
        res.json({status: false, error: err.message});
        return;
      }

      medRequest.dateCompleted = null;
      medRequest.save(function(err) {
        if(err) {
          res.json({status: false, error: err.message});
          return;
        }
        res.json({status: true});
        return;
      });
    });
  },

  UpdateLabRequests: function(req, res){
    const medRequest = req.body.medRequest;
    const errors = [];
    let addedCount = 0;
    let updatedCount = 0;

    if (medRequest != null) {
      medRequest.forEach(medRequest => {
        medRequest.findOne({key: medRequest.key}, function(err, oldmedRequest) {
          if(err) {
            errors.push(err.message);
            return;
          }

          // If no lab request exists on the server, add it
          if(!oldLabRequest) {
            LabRequestModel.create(labRequest, function(err) {
              if(err)
                errors.push(err);
              else
                addedCount++;
            });
            return;
          }

          // For updates, make sure the incoming object is up to date
          if(oldLabRequest.lastUpdated > labRequest.lastUpdated) {
            errors.push('LabRequest sent is not up-to-date. Sync required.');
          }

          // TODO: Iterate through forms and update individually if lastUpdated
          // works out, instead of a blanket set() call
          oldLabRequest.set(labRequest);
          //saves it, callback function to handle error
          oldLabRequest.save(function(e) {
            if(e) {
              errors.push(e);
            } else {
              updatedCount++;
            }
          });
        });
      });
    }
    res.json({errors: errors, addedCount: addedCount, updatedCount: updatedCount});
    return;
  },
  */
};

module.exports = MedicationRequestController;

