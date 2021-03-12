// TODO: maybe implement tests for these? the ServerDataService functions are
// essentially wrappers for the different server API endpoints, so might not
// need tests
import sinon from 'sinon';
import {serverData} from '../services/DataService';

global.fetch = require('jest-fetch-mock')

describe('describe method', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it('describe testcase', done => {
    // Mock the fetch() server call
    fetch.mockResponse(JSON.stringify({status: true}));
    done();

    /*
    serverData.methodCall(obj)
        .then( result => {
          expect(result).toEqual(true);
          done();
        })
        .catch( err => {
          done.fail(err);
        });
    */
  });
});
