/* Wrapper class to handle all firebase calls for this application */
import {firebase} from './firebase_config';
import {userHash, extractUser, extractUpdateToSave} from './UserUtil';

const database = firebase.database();

// Helper functions ===================================

// Returns promise of an update
function getUpdate(updateKey, groupId) {
  const updateRef = database.ref(`/groups/${groupId}/updates/${updateKey}`);
  return updateRef.once('value').then(snapshot => snapshot.val());
}

// Gets a new update key and then adds the update
function addUpdate(update, updatesTimestampRef, groupId) {
  // Get new update key for each update
  const updateKey = updatesTimestampRef.push(true).key;
  update = extractUpdateToSave(update, update.user);

  // TODO: Error handling of this set call
  const updateRef = database.ref(`/groups/${groupId}/updates/${updateKey}`);
  updateRef.set(update)
    .catch(error => console.log('Error while calling Firebase set()', error));

  const userUpdatesRef = database.ref(`/groups/${groupId}/user/${update.user}/${updateKey}`);
  userUpdatesRef.set(true);

  const usersRef = database.ref(`/groups/${groupId}/users/${update.user}`);
  usersRef.child('lastupdated').set(new Date().getTime());
}

// Returns a promise that resolves when all users are confirmed to be added to
// the database
// Also updates the updates objects to include the user: userKey key/value pair
function addNewUsers(updates, groupId) {
  const usersRef = database.ref(`/groups/${groupId}/users`);
  const newUserPromises = [];

  updates.forEach(update => {
    const hash = userHash(update);
    getUserKey(hash, groupId).then(userKey => {
      // User doesn't exist yet
      if(!userKey) {
        // Add them
        const pushRef = usersRef.push();
        userKey = pushRef.key;
        const promise = pushRef.child('data').set(hash);
        const promise2 = pushRef.child('lastupdated').set(new Date().getTime());
        newUserPromises.push(promise);
        newUserPromises.push(promise2);
      }
      update.user = userKey;
    });
  });
  return Promise.all(newUserPromises);
}

// Returns a promise of userKey
function getUserKey(hash, groupId) {
  const usersRef = database.ref(`/groups/${groupId}/users`);
  return usersRef.orderByChild('data').equalTo(hash).once('value')
    .then(snapshot => snapshot.val())
    .then(keyObj => keyObj ? Object.keys(keyObj)[0] : null);
}

// public functions ===================================

/*
 * Call callback on every update, passing in the list of users
 * Returns the callback function that can be passed in to off()
 *
 * Example:
 *     firebase.setupAllUsersStream(groupId, users => {
 *           this.setState({users: users});
 *     });
 *
 */
export function setupAllUsersStream(groupId, callback) {
  const updatesRef = database.ref(`/groups/${groupId}/users`);
  return updatesRef.on('value', snapshot => {
    let userKeysObj = snapshot.val();
    userKeysObj = userKeysObj ? userKeysObj : {};

    // usersObjs contains data: yyyymmdd&firstname&lastname and lastupdated
    const usersObjs = Object.keys(userKeysObj).map(key => userKeysObj[key]);
    const users = usersObjs.map(userObj=> extractUser(userObj));
    callback(users);
  })
}

/*
 * Call callback on every new update, passing in the user's updates
 * WARNING: Will not fire callback if an old update has been modified
 * Takes in a user object with fields: firstname, lastname, birthday
 * Returns the callback function that can be passed in to off()
 *
 * Example:
 *     firebase.setupUserUpdatesStream(user, groupId, updates => {
 *           this.setState({updates: updates})
 *     });
 *
 */

export function setupUserUpdatesStream(user, groupId, callback) {
  const hash = userHash(user);
  getUserKey(hash, groupId).then(key => {
    const updateKeysRef = database.ref(`/groups/${groupId}/user/${key}`);
    return updateKeysRef.on('value', snapshot => {
      const updateKeysObj = snapshot.val();
      const updateKeys = updateKeysObj ? Object.keys(updateKeysObj) : [];
      const updates = [];
      const promises = [];

      updateKeys.forEach(updateKey => {
        const promise = getUpdate(updateKey, groupId)
          .then(update => updates.push(update));
        promises.push(promise);
      });
      // When all updates are added and promises are resolved, then call callback
      Promise.all(promises)
        .then(() => callback(updates));
    });
  });
}

// Probably needs tinkering, untested
export function turnOffUserUpdatesStream(user, groupId, callback) {
  const hash = userHash(user);
  const updateKeysRef = database.ref(`/groups/${groupId}/user/${hash}`);
  updateKeysRef.off(callback);
}

/*
 * Adds updates for list of users
 * If timestamp is not defined, will create one
 */
export function addUpdates(updates, groupId, timestamp) {
  if(!Array.isArray(updates)) {
    throw new Error('addUpdates(updates): Non-array type passed in as updates');
  }
  if(!timestamp)
    timestamp = new Date().getTime();

  const groupRef = database.ref(`/groups/${groupId}/`);

  // Add timestamp and extract its generated key
  const newTimestampRef = groupRef.child('timestamps').push(timestamp);
  const timestampKey = newTimestampRef.key;
  const updatesTimestampRef = database.ref(`/groups/${groupId}/updates/timestamp/${timestampKey}`);

  // Add any new users, also adds the userKey to the update objects
  return addNewUsers(updates, groupId)
    .then(() => true)
    .catch(() => {throw new Error('addNewUsers() failed');})
    .then(() => {
      updates.forEach(update => {
        addUpdate(update, updatesTimestampRef, groupId);
      });
    });
}

