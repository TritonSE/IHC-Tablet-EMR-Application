/*
 * This is the mock we will use for the Realm database. Here we use Jest mocks
 * instead of Sinon because I couldn't figure out how to get it to work with
 * Sinon, but the concepts are the same. To mock out a method: 
 * 1. export a variable for a new mocked method:
 *   export const mockObjects = jest.fn();
 * 
 * 2. add the variable to the object as shown below
 * 3. In the test file, add
 *      import Realm, {mockObjects, mockCreate, etc...} from '../__mocks__/realm';
 *
 * 4. Add a fake implementation if required to cause an action or return an
 * object:
 *  mockObjects.mockImplementation((param) => {
 *    <function code goes here>
 *    return <whatever we are returning>
 *  });
 *
 * 5. Don't forget to mockClear() the mock after using it so that tests don't
 * affect each other:
 *  beforeEach(() => {
 *    mockObjects.mockClear();
 *  }
 */

export const mockObjects = jest.fn();
export const mockWrite = jest.fn().mockImplementation((fn) => {
  fn();
});;
export const mockCreate = jest.fn();
const mock = jest.fn().mockImplementation(() => {
  return {
    objects: mockObjects,
    create: mockCreate,
    write: mockWrite
  };
});

export default mock;
