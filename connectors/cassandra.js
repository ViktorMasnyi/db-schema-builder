const cassandra = require('cassandra-driver');
const config = require('../config/cassandra');
// const config = {};
const schema = require('../validators/cassandraConfigSchema');
const validate = require('../validators/validator');

const toJsonSchema = require('to-json-schema');

// const tmp = toJsonSchema(config);

// validate config
validate(config, schema);

const { contactPoints, localDataCenter, userName, password } = config;

let authProvider = new cassandra.auth.PlainTextAuthProvider(userName, password);

module.exports.client = new cassandra.Client({
    contactPoints: contactPoints,
    authProvider: authProvider,
    localDataCenter: localDataCenter,
    // keyspace:'store'
});
