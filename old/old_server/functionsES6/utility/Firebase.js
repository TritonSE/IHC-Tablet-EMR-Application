/* Wrapper class to handle all firebase calls for the MOBILE side */
import {userHash, extractUser, extractUpdateToSave} from './UserUtil';

// Helper functions ===================================

// Gets a new update key and then adds the update
function addUpdate(update, updatesTimestampRef, groupId, database) {
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
// Also updates the updates objects to include the user:userKey key/value pair
function addNewUsers(updates, groupId, database) {
  const usersRef = database.ref(`/groups/${groupId}/users`);
  const promises = [];
  const newUpdates = [];

  updates.forEach(update => {
    const hash = userHash(update);
    const getUserKeyPromise = getUserKey(hash, groupId, database).then(userKey => {
      // User doesn't exist yet
      if(!userKey) {
        // Add them
        const pushRef = usersRef.push();
        userKey = pushRef.key;
        const promise = pushRef.child('data').set(hash);
        const promise2 = pushRef.child('lastupdated').set(new Date().getTime());
        promises.push(promise);
        promises.push(promise2);
      }
      const newUpdate = Object.assign({}, update);
      newUpdate.user = userKey;
      newUpdates.push(newUpdate);
    });
    promises.push(getUserKeyPromise);
  });
  return Promise.all(promises).then(() => newUpdates);
}

// Returns a promise of userKey
function getUserKey(hash, groupId, database) {
  const usersRef = database.ref(`/groups/${groupId}/users`);
  return usersRef.orderByChild('data').equalTo(hash).once('value')
    .then(snapshot => snapshot.val())
    .then(keyObj => keyObj ? Object.keys(keyObj)[0] : null);
}

// public functions ===================================

/*
 * Adds updates for list of users
 * If timestamp is not defined, will create one
 */
export function addUpdates(updates, groupId, database, timestamp) {
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

  // Add any new users, returns updates with the userKey
  return addNewUsers(updates, groupId, database)
    .catch(() => {throw new Error('addNewUsers() failed');})
    .then(updates => {
      updates.forEach(update => {
        addUpdate(update, updatesTimestampRef, groupId, database);
      });
    });
}

