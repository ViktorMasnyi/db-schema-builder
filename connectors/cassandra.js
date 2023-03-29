const cassandra = require('cassandra-driver');
const config = require('../config/cassandra');
const schema = require('../validators/cassandraConfigSchema');
const validate = require('../validators/validator');

/**
 * As further improvement, I'd like to recommend introducing one additional
 * adapter class to decouple db connector and extraction logic. This adapter
 * should have getTableNames, getFirstRow, getTableSchema methods.
 * CQL queries strings are also need to be extracted and put in some dedicated place
 */

// validate config
validate(config, schema);

const { contactPoints, localDataCenter, userName, password, sysKeyspaceNames } = config;

const authProvider = new cassandra.auth.PlainTextAuthProvider(userName, password);
const client = new cassandra.Client({contactPoints, authProvider, localDataCenter})

async function getTableNames() {
    const tableNames = "SELECT * FROM system_schema.tables";
    const allTableNamesRes = await client.execute(tableNames, []);

    return allTableNamesRes.rows
        .filter(t => !sysKeyspaceNames[t.keyspace_name])
}

async function getDbStructure() {
    const schemaObj = {};
    const allUserTableNames = await getTableNames()

    for (const {keyspace_name, table_name} of allUserTableNames) {
        let tableSchemaRes = {};
        // trying to fetch first row
        let query = `SELECT *
                         FROM ${keyspace_name}.${table_name}
                         LIMIT 1`;

        let {rows: dataRows = []} = await client.execute(query, []);

        // checking if at least one row was found - if not - use table schema
        if (dataRows.length) {
            schemaObj[table_name] = dataRows[0];

            continue;
        }

        const schemaQuery = "SELECT * FROM system_schema.columns WHERE table_name = ? AND keyspace_name = ? ALLOW FILTERING";

        let { rows: schemaRows = [] } = await client.execute(schemaQuery, [table_name, keyspace_name]);

        if (schemaRows.length) {
            schemaRows.forEach(s => {
                tableSchemaRes = {...tableSchemaRes, [s.column_name]: s.type};
            });

            schemaObj[table_name] = tableSchemaRes;

        }
    }

    return schemaObj;
}

module.exports = {client, getDbStructure, getTableNames};

