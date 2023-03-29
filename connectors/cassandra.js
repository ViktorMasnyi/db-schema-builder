const cassandra = require('cassandra-driver');
const config = require('../config/cassandra');
const schema = require('../validators/cassandraConfigSchema');
const validate = require('../validators/validator');

/**
 * DB client and data extraction logic are encapsulated to the single module,
 * because they are intended to work with one particular DB. There is impossible
 * to reuse this parts with other DB types
 */

// validate config
validate(config, schema);

const { contactPoints, localDataCenter, userName, password, sysKeyspaceNames } = config;

let authProvider = new cassandra.auth.PlainTextAuthProvider(userName, password);
const client = new cassandra.Client({
    contactPoints: contactPoints,
    authProvider: authProvider,
    localDataCenter: localDataCenter,
})

async function getDbStructure() {
    const schemaObj = {};
    const tableNames = "SELECT * FROM system_schema.tables";
    const allTableNamesRes = await client.execute(tableNames, []).catch((err) => {
        console.log('ERROR apples:', err);
    });

    const allUserTableNames = allTableNamesRes.rows
        .filter(t => !sysKeyspaceNames[t.keyspace_name])

    for (const {keyspace_name, table_name} of allUserTableNames) {
        let tableSchemaRes = {};
        // trying to fetch first row
        let query = `SELECT *
                         FROM ${keyspace_name}.${table_name}
                         LIMIT 1`;

        let {rows = []} = await client.execute(query, []).catch((err) => {
            console.log('ERROR to fetch first row from table:', err);
        });

        // checking if at least one row was found - if not - use table schema
        if (rows.length) {
            schemaObj[table_name] = rows[0];

            continue;
        }

        const schemaQuery = "SELECT * FROM system_schema.columns WHERE table_name = ? AND keyspace_name = ? ALLOW FILTERING";

        let { rows: schemaRows = [] } = await client.execute(schemaQuery, [table_name, keyspace_name]).catch((err) => {
            console.log('ERROR to fetch the schema from system_schema:', err);
        });

        if (schemaRows.length) {
            schemaRows.forEach(s => {
                tableSchemaRes = {...tableSchemaRes, [s.column_name]: s.type};
            });

            schemaObj[table_name] = tableSchemaRes;

        }
    }

    return schemaObj;
}

module.exports = {client, getDbStructure};

