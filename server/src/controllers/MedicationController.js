import MedicationModel from '../models/Medication';

const MedicationController = {

  /* body: medication object */
  CreateMedication: function(req, res) {
    MedicationModel.findOne({key: req.body.medication.key}, function(err, drug) {
      if (drug) {
        err = new Error(`A medication with the key ${req.body.medication.key} already exists`);
      }
      if (err) {
        res.json({status: false, error: err.message});
        return;
      }
      MedicationModel.create(req.body.medication, function (err) {
        if(err) {
          res.json({status: false, error: err.message});
          return;
        }
        res.json({status: true});
        return;
      });
    });
  },
  /* body: NA, returns: array of medication objects */
  GetMedications: function(req, res) {
    MedicationModel.find({drugName: req.params.name}, function(err, drugs) {
      if (drugs.length === 0) {
        err = new Error(`A medication with the name ${req.params.name} does not exist`);
      }
      if(err) {
        res.json({status: false, error: err.message});
        return;
      }
      res.json({status: true, medications: drugs});
      return;
    });
  },

  /* body: medication object */
  UpdateMedication: function(req, res) {
    MedicationModel.findOne({key: req.params.key}, function(err, drug) {
      if (!drug) {
        err = new Error(`A medication with the key ${req.params.key} does not exist`);
      }
      if (err) {
        res.json({status: false, error: err.message});
        return;
      }

      if(drug.lastUpdated > req.body.medication.lastUpdated) {
        res.json({
          status: false,
          error: 'Medication sent is not up-to-date. Sync required.'
        });
        return;
      }

      for (let p in req.body.medication) {
        if (p !== 'drugName' && p !== 'dosage' && p !== 'units' && p !== 'key') {
          drug[p] = req.body.medication[p];
        }
      }

      //saves it, callback function to handle error
      drug.save(function(err) {
        if(err) {
          res.json({status: false, error: err.message});
          return;
        }
        res.json({status: true});
        return;
      });
    });
  },
  DeleteMedication: function(req, res) {
    MedicationModel.deleteMany({key: req.params.key}, function(err, drug) {
      if(!drug) {
        err = new Error(`A medication with the key ${req.params.key} does not exist`);
      }
      if (err) {
        res.json({status: false, error: err.message});
        return;
      }
      res.json({status: true});
      return;
    });
  },
  UpdateMedications: function(req, res){
    const medications = req.body.medications;
    const errors = [];
    let addedCount = 0;
    let updatedCount = 0;

    medications.forEach(medication => {
      MedicationModel.findOne({key: medication.key}, function(err, oldMedication) {
        if(err) {
          errors.push(err.message);
          return;
        }

        // If no patient exists on the server, add them
        if(!oldMedication) {
          MedicationModel.create(medication, function(err) {
            if(err)
              errors.push(err);
            else
              addedCount++;
          });
          return;
        }

        // For updates, make sure the incoming object is up to date
        if(oldMedication.lastUpdated > medication.lastUpdated) {
          errors.push('Medication sent is not up-to-date. Sync required.');
        }

        // TODO: Iterate through forms and update individually if lastUpdated
        // works out, instead of a blanket set() call
        oldMedication.set(medication);
        //saves it, callback function to handle error
        oldMedication.save(function(e) {
          if(e) {
            errors.push(e);
          } else {
            updatedCount++;
          }
        });
      });
    });
    res.json({errors: errors, addedCount: addedCount, updatedCount: updatedCount});
  },
  GetUpdatedMedications: function(req, res){
    const timestamp = parseInt(req.params.lastUpdated);
    // couldn't convert properly
    if(isNaN(timestamp)) {
      res.json({status:false, error: 'Error converting lastUpdated to int'});
      return;
    }

    MedicationModel.find({ lastUpdated: {$gt: timestamp} },function(err, medicationsList){
      if(err){
        res.json({status:false, error: err.message});
        return;
      }
      res.json({status: true, medications: medicationsList});
    });
  }
};

module.exports = MedicationController;
