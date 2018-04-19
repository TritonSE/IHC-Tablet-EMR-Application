import * as _firebase from "firebase";

const config = {
  apiKey: "AIzaSyAVjd2ZoKF0r7alWa3yXOv7SgvxANiskaM",
  authDomain: "ihc-database.firebaseapp.com",
  databaseURL: "https://ihc-database.firebaseio.com/",
  storageBucket: "ihc-database.appspot.com",
};
_firebase.initializeApp(config);
export let firebase = _firebase;

// Eventually make DEV dependent on env variables
/* This part can probably be removed if web frontend directly talks with
 * Firebase instead of through Express
 * let DEV = process.env.NODE_ENV === 'development';
 * export let api_home = DEV ? 'http://localhost:5001/ihc-database/us-central1/api' : 
 *                          'https://us-central1-ihc-database.cloudfunctions.net/api';
 */
