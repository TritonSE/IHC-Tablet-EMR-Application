# IHC EMR Overview

Mobile: React Native, Jest tests (Sinon for stubbing), Realm database

Server: ExpressJS, MongoDB database with Mongoose, Jest tests (Sinon for
stubbing)

Keystore password: ihcapp

## Local Environment Setup

## Building APK

## Installing APK

# Dev Docs/ Old Readme

Shortcuts:

* [Command line](#command-line)
* [How to](#how-to)
##### 0. setup the environment
##### 1. go through coding process
##### 2. make a new screen
##### 3. make a new Express API route
##### 4. create automated tests for the server API
##### 5. manually test the server API
##### 6. start the router setup for tablets
##### 7. test React Native code
##### 8. install the app on an emulator/device
##### 9. Handle syncing the tablets with the server
* [Overview](#overview-use-cases)
* [API](#local-server-api)
* [Local storage plan](#local-storage)
* [Local Database](#realm-database-design)
* [Server Database](#mongo-database-design)

### Directory organization

IHC/
  - mobile
    - Ihc
      - screens
        - Individual pages of the app
      - components
        - Put any reusable components here
      - services
        - FakeDataService.js: Simulate calls to Express server
        - DataService.js: Hold all calls to fetch()
  - web
    - React code to view admin panel
    - Current directory is very messy, filter out unnecessary stuff
    - Low priority
  - server
    - ExpressJS local server

Moqup:
https://app.moqups.com/mattchinn/ix0mjskH6z/view

==========================================

### Command line

##### Run react native:
1. Start emulator (10 inch tablet)
 
  (Setup instructions here: https://facebook.github.io/react-native/docs/getting-started.html
    "Building Projects With Native Code" -> Target OS: Android)

  i.e. In my ~/.bashrc I made this function, so I could just call run_emulator 
  ```
  function run_emulator {
      /Users/Matt/Library/Android/sdk/tools/emulator -avd Nexus_10_API_23_Tablet
      # Wherever your emulator is stored
  }
  export -f run_emulator
  ```

2. Run ```react-native run-android``` inside IHC/mobile/Ihc directory

3. To connect to the Express server, must change the fetchUrl field within
   mobile/ihc/config.json to your computer's IP address

##### Run react native tests:
1. Run ```npm test``` inside IHC/mobile/Ihc

##### Run Express server:

*Inside IHC/server directory

1. After making changes, must build the code (transpile from ES6 to JS). Run
   ```npm run make```
2. Run server by calling ```npm run server```
3. OR to both make and run server, call ```npm start```

4. Start database server with ```npm run db```
5. // TODO: Create a command that spawns a new shell that runs the db (if it
   hasn't been started yet), and then runs npm start

==========================================

### How to...

##### 0. setup the environment

  * This is not meant to be a comprehensive list, but hopefully provides a solid
    list of all the steps required
      1. Go to the github page (github.com/matthew-chinn/ihc) and click "Fork" to
         get your own copy on github
      2. From terminal, use ```git clone <your github repo url>``` to get a
         local copy of the repository
      3. Download mongodb (for backend)
      4. Download an Android emulator (i.e. Nexus 10 inch tablet), probably
         through Android Studio (for frontend)
      5. run ```npm install``` in ihc/mobile, ihc/server, and ihc/server/src to
         download dependencies

##### 1. go through coding process
    1. Make code changes
    2. Push code changes to your own Github repository
    3. Click on "New pull request"
    4. I will review pull requests and either merge the changes or reply with
       feedback

##### 2. make a new screen

  *  First of all, distinguish component vs screen:
      - Component is a reusable piece of small UI, aka a common table
      - Screen is akin to single webpage, and the moqup pages almost all represent a
        new screen. In terms of React, a Screen is a component, but the smaller
        reusable components will go in IHC/mobile/Ihc/components instead.
        
  i. Create the screen component in IHC/mobile/Ihc/screens
  
  ii. Register the component in screens/index.js
  
  iii. Can navigate to a screen by doing
  ```javascript
    this.props.navigator.push({
      screen: 'Ihc.<Component name>'
    });
  ```
  
  * For now, wherever you need data from the Express server, make a helper
    function in the services/FakeDataService.js file and create your own sample
    data. Eventually we will use real calls to the server and put that in
    DataService.js

Other options are available: https://wix.github.io/react-native-navigation/#/screen-api

##### 3. make a new Express API route

  1. Go to server/src/routes.js and add the route:
     ```javascript
     router.get('/patient/:key', PatientController.GetPatient);
     ```

  2. Add implementation and database interaction in the appropriate
     server/src/controllers file:
     ```javascript
     GetPatient: function(req, res){
       PatientModel.findOne({key: req.params.key}, function(err, patient) {
       if(!patient) {
         err = new Error("Patient with key " + req.params.key + " doesn't exist");
       }
       if(err) {
         res.json({status: false, error: err.message});
         return;
       }
       res.json({status: true, patient: patient});
       });
     }
      ```

  3. Update the README API Section for that route with the expected body and return
     object information (if necessary)

  4. Add tests as explained below
        
##### 4. create automated tests for the server API
  * Helpful resources:      
  * http://www.albertgao.xyz/2017/05/24/how-to-test-expressjs-with-jest-and-supertest/
  * https://semaphoreci.com/community/tutorials/a-tdd-approach-to-building-a-todo-api-using-node-js-and-mongodb
  1. Example:
  ```javascript
    test('/patient/:key should return patient if they exist', () => {
      const model = { firstName: "Test" };

      // Mocking prevents us from having to use the real database. We can
      // simulate the database and return fake, but relatively realistic, values
      // Here, the PatientModel.findOne() method normally passes (error, data)
      // to a callback function, so in this case we pass null for error, and our
      // fake model as the data.
      mock = sinon.mock(PatientModel)
        .expects('findOne').withArgs({key: 'keythatexists'})
        .yields(null, model);

      // Test the API route with the correct route, and expect whatever object
      // should be returned
      return request(app).get('/patient/keythatexists')
        .expect({status: true, patient: model});
    });
  ```


##### 5. manually test the server API
  * Make sure the database server is running (```mongod```)

  1. Run a CURL command like this:
    ```
    curl -d '{"patientInfo": {"firstName": "Brandony"}}' \
    -X POST -H "Content-Type: application/json" \
    http://localhost:8000/signin/newpatient
    ```

  2. Or use Postman (an app that allows you to test server routes in a easier
     way)

  3. Inspect the mongo database (to ensure changes go through properly) 
     with a command sequence such as:
     ```mongo``` to start a database shell, which will allow you to look around
     the db

     ```use data``` to switch to the 'data' database

     ```db.patients.find()``` to view all of the patients in the database

     ```db.patients.find(<filter>)``` to view patients that meet the specified
     filter. Look up MongoDB documentation for details

##### 6. start the router setup for tablets
  
  1. Connect computer to router with ethernet cable

  2. Start the server with ```npm start``` or ```npm run server```
     and the database with ```npm run db```

  3. Make the computer's IP address a hardcoded value i.e. 192.168.1.100

  4. Update config file for variable SERVER_URL to equal <ip address>:<port>
     i.e. '192.168.1.100:8000' // TODO make config file

##### 7. test React Native code

  1. Use Jest test framework: https://medium.com/react-native-training/learning-to-test-react-native-with-jest-part-1-f782c4e30101
     - 1a. Currently need to alter some code because of dependency annoyances. Go
       to mobile/Ihc/node_modules/realm/lib/extensions.js:260 and ensure the code
       is:

    ```javascript
        if (!realmConstructor.Permissions) {
          Object.defineProperty(realmConstructor, 'Permissions', {
              value: permissionsSchema,
              configurable: false
          });
        }
    ``` 

  2. Use Enzyme to test changing state within components (example included in above link)
  3. Stub methods (such as database calls) with Sinon: http://sinonjs.org/

##### 8. install the app on an emulator/device

  0. If on an emulator, first go to Settings->Apps->Browser->Permissions, and
     enable Storage

  1. Download the .apk file from the Google Drive from your device (i.e. through the
     browser).

  2. Go to Settings->Security->Unknown Sources, and enable installation of apps
     from unknown sources. (Probably want to turn this back off after
     installation is successful).

  3. Go to the Downloads file on the device and click on the .apk file

##### 9. Handle syncing the tablets with the server

  1. Anytime we want data from the local database, such as when we click on a
     Patient and want to see their current SOAP form, then as a general rule of
     thumb, 

     i. Grab data locally, to display in case the server sync doesn't work
     ii. Sync with the server using the helper functions in
         mobile/Ihc/util/Sync.js
     iii. Re-grab data locally, which should now include the data that was just
          received from the server
     iv. If the server sync failed, then display an error message, and render
         the preexisting data

  2. Anytime we are saving data to the local database, then 
    
    i. Save data locally
    ii. Upload data to server using the appropriate ServerDataService function
        call
    iii. If the server upload fails, then display an error message and show a retry
         button so they can try again
 
  3. To allow the user to "cancel" service calls:

    i. There is a button within the Loading component that calls this.props.setLoading,
       which is passed from the parent screen (into the Container component,
       which passes it to the Loading component). View PatientSelectScreen for
       an example.
    ii. However, fetch calls can't actually be cancelled because the API doesn't
        support it. Thus, by "cancel", we actually mean return control over to
        the user, but let the network request happen in the background.
        This is so that in cases where the network might be unresponsive, users can
        still operate the tablet with the understanding that updates might not
        be sent to the server.
    iii. To support this, after the service call (i.e. serverData.createPatient()),
         you can check if this.state.loading === true. If it is true, then user
         did not "cancel" the service call. However, if this.state.loading ===
         false, then the user DID "cancel" the service call (because
         "cancelling" exits out of the loading screen). Thus we want to display
         the proper response. Generally, we only want to display the server's
         response if the service call was not cancelled, because otherwise the
         user isn't expecting there to be a response.
    iv. CAVEAT: For post/puts, the user might try sending a server call and
        then cancelling, thus thinking that the call won't go to the network,
        but in the background it still is. They also might think that the data
        was not saved locally, but the data should have been saved locally,
        regardless of if the server call was cancelled. 
        TODO: Find some way of conveying this properly...
    v. We also want to keep note that if the user cancels a GET server call,
       then the tablet may be out of sync if the cancel means we did not
       download new data from the server. Thus, you may need to keep track of if
       the server call is a downstream/GET call or an upstream/POST/PUT call,
       and then render a different message if the downstream call was cancelled.
       View PatientSelectScreen for an example.

==========================================

### Overview Use Cases:
Patient gets a new SOAP and Triage form every visit

Medication and growth chart forms reused

Other considerations:
Misc file upload per patient
  - folder to hold scans of anything
Field for who was triager
Potential password? lock screen after given amount of time?
If router went out, potentailly pass tablets around

##### High level plan:

Mobile:

- Patients sign in on tablets
- Stations add data for that patient as they go through clinic
- Tablets call API endpoints for local server
  - Store all data received locally in case of router problems
    - Figure out how to update new data efficiently!!!
    - Have a sync button that syncs up all tablets
- Must include Spanish

Laptop:

- Primary need: 
        - Run local server over a local network through router
        - Store all data in local mongo database
- Other use cases:
  (Low priority)
  - View table of all patients and go through data
- Portal for inputting records, probably into Excel and import csv
  
==========================================

### Local server API:

Any :date field should be represented as a string in the form yyyymmdd
When saying _Model, such as PatientModel, it means that the object should
have the same properties as the schema for that Model. It shouldn't be an actual Mongoose
Model object because we will construct that on the backend. If we run into issues
with this level of vagueness, we can specify which properties exactly should be
passed.

router.get('/patient/:key', PatientController.GetPatient);
  ```
  returns: {
    patient: PatientModel
  }
  ```

router.get('/patients/:lastUpdated', PatientController.GetPatients);
  ```
  returns: {
    patients: [PatientModel]
  }
  ```

router.post('/patient', PatientController.CreatePatient); :white_check_mark:
  ```
  body: {
    patient: PatientModel
  }
  ```

router.put('/patient/:key', PatientController.UpdatePatient);
  ```
  body: {
    patient: PatientModel
  }
  ```

router.put('/patients', PatientController.UpdatePatients);
  ```
  body: {
    patients: [PatientModel]
  }
  returns: {
    errors: [Error],
    addedCount: int,
    updatedCount: int
  }
  ```

router.get('/patient/:key/status/:date', PatientController.GetStatus);
  ```
  returns: {
    patientStatus: StatusModel
  }
  ```

router.get('/patients/statuses', PatientController.GetStatuses);
  ```
  returns: {
    patientStatuses: [StatusModel]
  }
  ```

router.get('/patient/:key/triage/:date', PatientController.GetTriage);
  ```
  returns: {
    triage: TriageModel
  }
  ```

router.get('/patient/:key/drugUpdates', PatientController.GetDrugUpdates);
  ```
  returns: {
    drugUpdates: [DrugUpdateModel]
  }
  ```

router.put('/patient/:key/soap/:date', PatientController.UpdateSoap);
  ```
  body: {
    soap: SoapModel
  }
  ```

router.put('/patient/:key/status/:date', PatientController.UpdateStatus);
  ```
  body: {
    status: StatusModel
  }
  ```

router.put('/patient/:key/triage/:date', PatientController.UpdateTriage);
  ```
  body: {
    triage: TriageModel
  }
  ```

router.put('/patient/:key/drugUpdate/:date', PatientController.UpdateDrugUpdate);
  ```
  body: {
    drugUpdate: [DrugUpdateModel] 
  }
  ```

router.get('/patient/:key/soap/:date', PatientController.GetSoap);
  ```
  returns: {
    soap: SoapModel
  }
  ```

==========================================

### Local Storage:

Use Realm as the mobile database

When Updating/Creating objects, we need to add changes to both the mobile and
server sides.


Possible situations:
1. Mobile update fails:
  Display error
  Don't send to server so that we can fix error locally first

2. Mobile update succeeds, Server update fails:
  Mark patient as needToUpload (to the server)
  Display error telling user to UploadUpdates

3. Mobile update succeeds, Server update succeeds:
  Display success message


Handling LOCAL STORAGE as backup:
If router goes out...

- Biggest need is viewing old data, they could use paper forms temporarily.
- Needs to be in sync with history and current changes from a previous station

##### Lifecycle:

Beginning:
- Start with all history of previous patients

Signin:
- If new patient, then add to local storage and send to server for others to
grab
- If existing patient, then update their Status object both locally and on the
  server

Triage/SOAP:
(Only let one person modify at a time)
- Call server, if it doesn't have a form yet then open blank form
  - If form does exist, render
- If "Save", add to local storage and then send to server

Medication List:
- Display past from local storage
- On "Save", add to local storage and send to server

At end of session:
- Tablets click "Sync and end session" or something
  - Grab all patients with updates later than timestamp
  - (Should base last_updated_timestamps on local device, not the server)
  - Replace patients with new data
 
==========================================

### Realm Database design:

The schema for the local storage Realm database is defined in mobile/Ihc/models.

### Mongo Database design:

The schema for the server's Mongo database is defined in server/src/models.

