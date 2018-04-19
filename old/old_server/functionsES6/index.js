import * as functions from "firebase-functions"
import express from "express"
import * as admin from "firebase-admin"
import bodyParser from "body-parser"
import * as firebase from "./utility/Firebase"
//const cors = require('cors')({origin: true});

/*
 * API:
 * ESSENTIAL:
 * GET   /groups/:group/all/:timestamp   => Return information for updates after
 *                                          last_synced_timestamp
 * PATCH /groups/:group/all              => Update information
 *                                          for all people
 * - Body should contain list of people objects
 *
 * NONESSENTIAL:
 * GET   /:group/:id   => Return information
 *                        for that person
 * POST  /:group       => Add information for
 *                        new person
 * PATCH /:group/:id   => Update information
 *                        for person
 */
const app = express();
admin.initializeApp(functions.config().firebase);
const db = admin.database();

/* Web frontend will talk directly to firebase and not through here. Only mobile
 * will request through Express and CORS isn't required for mobile
 *
var corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

// app.use(cors(corsOptions));
app.use(cors);
*/

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/groups/:group/all/:timestamp", (req, res) => {
  const groupId = req.params.group;
  const timestampParam = parseInt(req.params.timestamp);
  const excludeTimestamps = req.query.exclude;

  // :timestamp should be a number, but wasn't
  if(Number.isNaN(timestampParam)) {
    res.status(400).send({
      error: 'Invalid "' + req.params.timestamp + ' passed as timestamp'
    });
  }

  // Grab list of timestamps from groups/:groupid/timestamps
  const timestampRef = db.ref(`/groups/${groupId}/timestamps`);

  timestampRef.once("value")
    .then(snapshot => snapshot.val())
    // Only care about timestamps after the passed in time
    // and filter out keys that are labeled as exclude
    .then(keysObj => Object.keys(keysObj)
        .filter(key => {
          const currTimestamp = keysObj[key];
          if(currTimestamp < timestampParam)
            return false;

          if(Array.isArray(excludeTimestamps)) {
            return excludeTimestamps.indexOf(currTimestamp.toString()) === -1;
          }
          else {
            return excludeTimestamps !== currTimestamp;
          }
        }),
        error => [])
    // Build list of promises of updateKey to resolve
    .then(timestampKeys => {
        let promises = [];
        const updateRef = db.ref(`/groups/${groupId}/updates/timestamp`);
        timestampKeys.forEach(timestampKey=> {
          const currRef = updateRef.child(`/${timestampKey}`);
          promises.push(currRef.once("value"));
        });
        return Promise.all(promises);
    })
    .then(snapshots => snapshots.map(snapshot => snapshot.val()))
    // Have updateKeyObjs, extract updateKey and combine into one list
    .then(objs => 
      objs.reduce( (total, curr) => total.concat(Object.keys(curr)), [] )
    )
    // For each updateKey, get the actual update promise
    .then(updateKeys => {
        let promises = [];
        const updateRef = db.ref(`/groups/${groupId}/updates/`);
        updateKeys.forEach(updateKey => {
          const currRef = updateRef.child(`/${updateKey}`);
          promises.push(currRef.once("value"));
        });
        return Promise.all(promises);
    })
    .then(updates => {
        res.status(200).send({updates: updates});
    }, error => { res.status(500).send({error: 'Error: ' + error}); });
});

app.patch("/groups/:group/all", (req, res) => {
  const groupId = req.params.group;

  // When the "Send updates" button was clicked
  const timestamp = req.body.timestamp;
  // List of user updates
  const userUpdates = req.body.user_updates;

  firebase.addUpdates(userUpdates, groupId, db, timestamp)
    .then( () => res.send(true), (error) => res.status(500).send({error: error}))
});

/*
app.post("/groups/:group/newpatient", (req, res) => {
  const groupId = req.params.group;
  const personId = `${req.body.firstname}${req.body.lastname}${req.body.birthday}`;
  console.log("post /group/newpatient to person " + personId);

  const ref = db.ref(`/${groupId}/${personId}`);
  ref.push(extractData(req.body));
  res.send(true);
});
*/

app.get("/groups/:group/:id", (req, res) => {
  res.send("patch /groups/:group/:id")
});

app.post("/groups/:group", (req, res) => {
  res.send("patch /groups/:group/all")
});

app.patch("/groups/:group/:id", (req, res) => {
  res.send("patch /groups/:group/:id")
});

app.get("*", (req,res) => {
  res.send("Error: No path matched");
});

function extractData(body) {
  return {firstname: body.firstname, lastname: body.lastname, birthday: body.birthday};
}

export let api = functions.https.onRequest(app);
