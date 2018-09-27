const { authenticate } = require('@feathersjs/authentication').hooks;
const { setNow } = require('feathers-hooks-common');
const hooks = require('feathers-authentication-hooks');


module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [
      setNow('createdAt'),
      hooks.associateCurrentUser()
    ],
    update: [hooks.restrictToOwner()],
    patch: [hooks.restrictToOwner()],
    remove: [hooks.restrictToOwner()]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
