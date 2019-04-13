export default class Credentials {
  static extractFromForm(form) {
    const credentials = Object.assign({}, form);
    return credentials;
  }
}

Credentials.schema = {
  name: 'Credentials',
  properties: {
    userId: 'string',
    password: 'string',
    location: 'string',
  }
};
