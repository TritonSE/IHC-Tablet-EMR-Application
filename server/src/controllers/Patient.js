//treat these imports as 'containers'
//to access/modify these containers, look up mongodb functions
import PatientModel from '../models/Patient';
import SoapModel from '../models/Soap';
import StatusModel from '../models/Status';
import TriageModel from '../models/Triage';
import DrugUpdateModel from '../models/DrugUpdate';

//function params for all calls are generally the same function(req,res)
const PatientController = {
  //GET API CALL
  //treat 'req' as info being passed in from the front end and 'res' as a tool to send things back to the front end
  GetPatient: function(req, res){
    //this function finds ONE document in the patientModel container
    //first parameter is an object with the attribute(s) that the function is trying to match to a document with in the container
    //second parameter is a callback function once the function finds the document, or an error occurs
      //params for this function is err (in case an error occur) and patient (the returned object)
    PatientModel.findOne({key: req.params.key}, function(err, patient) {
      if(!patient) {
        err = new Error("Patient with key " + req.params.key + " doesn't exist");
      }
      if(err) {
        res.json({status: false, error: err.message});
        return;
      }
      //res.json sends back info to the front end
      //we're sending back an object with a status and patient attribute
      //status for if an error occured or not, and patient for the patients info
      res.json({status: true, patient: patient});
    });
  },
  GetPatients: function(req, res){
    PatientModel.find({},function(err, patientList){
      if(!patientList || patientList.length == 0){
        err = new Error("No Patients Exist");
      }
      if(err){
        res.json({status:false, error:err.message});
        return;
      }
      res.json({status: true, patients: patientList});
    });
  },
  CreatePatient: function(req, res){
    // Check that no patient with that key exists
    PatientModel.findOne({key: req.body.patient.key}, function(err, patient) {
      if (patient) {
        // Hopefully shouldn't happen, but would be rare enough to not worry
        // about
        err = new Error("Patient already exists with that name and birthday. Use a different name");
      }
      if(err) {
        res.json({status: false, error: err.message});
        return;
      }
    });

    const patient = PatientModel.create(req.body.patient, function (err) {
      if(err) {
        res.json({status: false, error: err.message});
        return;
      }
      res.json({status: true});
    })
  },
  UpdatePatient: function(req, res){
    PatientModel.findOne({key: req.params.key}, function(err, oldPatient) {
      if(!oldPatient) {
        err = new Error("Patient with key " + req.params.key + " doesn't exist");
      }
      // For updates, make sure the incoming object is up to date
      if(oldPatient.lastUpdated > req.body.patient.lastUpdated) {
        err = new Error("Patient sent is not up-to-date. Sync required.");
      }
      if(err) {
        res.json({status: false, error: err.message});
        return;
      }

      //update function, replaces old pation object with passed in 'new patient' info boject
      oldPatient.set(req.body.patient);
      //saves it, callback function to handle error 
      oldPatient.save(function(e, p) {
        if(e) {
          res.json({status: false, error: e.message});
          return;
        }
        res.json({status: true});
        return;
      });
    })
  },
  GetUpdates: function(req, res){
  },
  GetSoap: function(req, res){
    SoapModel.findOne({patientKey: req.params.key, date: req.params.date}, function(err, soap) {
      if(!soap) {
        err = new Error("Patient with key " + req.params.key + " does not have a soap for the date " + req.params.date);
      }

      if (err) {
        res.json({status: false, error: err.message});
        return;
      }
      res.json({status: true, soap: soap});
    });
  },
  GetStatus: function(req, res){
    StatusModel.findOne({patientKey: req.params.key, date: req.params.date}, function(err, patientStatus) {
      if (!patientStatus) {
        err = new Error("Status of patient with key " + req.params.key + " for the date " + req.params.date + " does not exist");
      }
  
      if (err) {
        res.json({status: false, error: err.message});
        return
      }
      res.json({status: true, patientStatus: patientStatus});
    });
  },
  GetTriage: function(req, res){
  },
  GetDrugUpdates: function(req, res){    
    PatientModel.findOne({key: req.params.key}, function(err, patient) {
      if(!patient) {
        err = new Error("Patient with key " + req.params.key + " doesn't exist");
      }
      if(err) {
        res.json({status: false, error: err.message});
        return;
      }
      res.json({status: true, drugUpdates: patient.medications});
    });
  },
  
  UpdateSoap: function(req, res){
    PatientModel.findOne({key: req.params.key}, function(err, patient) {
      if(!patient) {
        err = new Error("Patient with key " + req.params.key + " doesn't exist");
      }

      for(let [i,soap] of patient.soaps.entries()) {
        // If an existing soap for that date exists, then update it
        if(soap.date == req.body.soap.date) {
          if(soap.lastUpdated > req.body.soap.lastUpdated) {
            res.json({
              status: false,
              error: "Soap sent is not up-to-date. Sync required."
            });
            return;
          }

          patient.soaps[i] = req.body.soap;
          patient.lastUpdated = req.body.soap.lastUpdated;
          patient.save(function(err) {
            if(err) {
              res.json({status: false, error: err.message});
              return;
            }
            res.json({status: true});
            return;
          });
          return;
        }
      }

      // No soap exists yet, so add a new one
      patient.soaps.push(req.body.soap);
      patient.lastUpdated = req.body.soap.lastUpdated;
      patient.save(function(err) {
        if(err) {
          res.json({status: false, error: err.message});
          return;
        }
        res.json({status: true});
        return;
      });
    });
  },
  UpdateStatus: function(req, res){
    PatientModel.findOne({key: req.params.key}, function(err, patient) {
      if(!patient) {
        err = new Error("Patient with key " + req.params.key + " doesn't exist");
      }

      for (let [i,status] of patient.statuses.entries()) {
        if (status.date = req.params.date) {
        //status is not updated
          if (status.lastUpdated > req.body.status.lastUpdated) {
            res.json({
              status: false,
              error: "Status sent is not up-to-date. Sync required."
            })
            return;
          }

          patient.statuses[i] = req.body.status;
          patient.save(function(err) {
            if(err) {
              res.json({status: false, error: err.message});
              return;
            }
            res.json({status: true});
            return;
          });
          return;
        }
      }

      //status does not exist yet
      patient.statuses.push(req.body.status);
      patient.save(function(err) {
        if (err) {
          res.json({status: false, error: err.message});
          return;
        }
        res.json({status: true});
        return;
      });
  });
  },
  UpdateTriage: function(req, res){
  },
  // to be done 
  UpdateDrugUpdates: function(req, res){
  }
};

module.exports = PatientController;
