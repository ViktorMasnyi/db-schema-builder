const toJsonSchema = require('to-json-schema');
const { writeFile } = require('fs')
// ”cassandra-driver” is in the node_modules folder. Redirect if necessary.
let cassandra = require('cassandra-driver');
// todo: validate config at bootstrap
// ============== CONNECTOR============
// Replace 'Username' and 'Password' with the username and password from your cluster settings
let authProvider = new cassandra.auth.PlainTextAuthProvider('cassandra', 'cassandra'); // todo: use config
// Replace the PublicIPs with the IP addresses of your clusters
let contactPoints = ['localhost'];
// Replace DataCenter with the name of your data center, for example: 'AWS_VPC_US_EAST_1'
let localDataCenter = 'datacenter1';

let client = new cassandra.Client({contactPoints: contactPoints, authProvider: authProvider, localDataCenter: localDataCenter, keyspace:'store'});
// ==============END OF CONNECTOR============

// ==============DATA EXTRACTOR============
// Get all table names
const tableNames = "SELECT * FROM system_schema.tables";
// Get table schema
const schemaQuery = "SELECT * FROM system_schema.columns WHERE table_name = 'shopping_cart' AND keyspace_name = 'store' ALLOW FILTERING";
// Define and execute the queries
let query = 'SELECT userid, item_count, data FROM store.shopping_cart WHERE userid=? ALLOW FILTERING';
// let q1 = client.execute(query, ['1111']).then(result => {console.log('Single row example ' + JSON.stringify(result.rows[0]) + '\n'.repeat(3));}).catch((err) => {console.log('ERROR oranges:', err);});
// let q2 = client.execute(schemaQuery, []).then(result => {console.log('The table schema ' + JSON.stringify(result.rows) + '\n'.repeat(3));}).catch((err) => {console.log('ERROR pineapples:', err);});
// let q3 = client.execute(tableNames, []).then(result => {console.log('Table names ' + JSON.stringify(result.rows) + '\n'.repeat(3));}).catch((err) => {console.log('ERROR apples:', err);});
// todo: check if DB has custom keyspaces - not only default ones
/**
 *
 * Default Cassandra keyspaces:
 *
 * "keyspace_name": "system_schema"
 * "keyspace_name": "system_auth"
 * "keyspace_name": "system_distributed"
 * "keyspace_name": "system"
 * "keyspace_name": "system_traces"
 *
 */

// ==============END OF DATA EXTRACTOR============
(async function() {
    const schemaArr = [];
    const allTableNamesRes = await client.execute(tableNames, []).catch((err) => {console.log('ERROR apples:', err);});
    const sysKeyspaceNames = { // todo: add to config
        "system_schema": true,
        "system_auth": true,
        "system_distributed": true,
        "system": true,
        "system_traces": true
    };

    const allUserTableNames = allTableNamesRes.rows
        .filter(t => !sysKeyspaceNames[t.keyspace_name])
        .map(t => ({keyspace_name: t.keyspace_name, table_name: t.table_name}));

        for (const { keyspace_name, table_name } of allUserTableNames) {
            let tableSchemaRes = {};
            // trying to fetch first row
            let query = `SELECT * FROM ${keyspace_name}.${table_name} LIMIT 1`;

            let { rows = [] } = await client.execute(query, []).catch((err) => {console.log('ERROR oranges:', err);});
            console.log('qq row example ' + JSON.stringify(rows) + '\n'.repeat(3));
            if (rows.length) {
                // add to res object
                tableSchemaRes = {...rows[0]};
                const options = {
                    postProcessFnc: (type, schema, value, defaultFunc) => {
                        if (type === 'string' && value.startsWith('{')) {
                            try {
                                const parsedValue = JSON.parse(value);
                                toJsonSchema(tableSchemaRes, options)
                                return defaultFunc("object", toJsonSchema(parsedValue), parsedValue);
                            } catch (e) {
                                console.log('JSON parse err ', e);

                            }
                        }
                        return defaultFunc(type, schema, value)
                    }
                }
                schemaArr.push({...toJsonSchema(tableSchemaRes, options), title: table_name});
                continue;

            }

            const schemaQuery = "SELECT * FROM system_schema.columns WHERE table_name = ? AND keyspace_name = ? ALLOW FILTERING";

            let { rows: schemaRows = [] } = await client.execute(schemaQuery, [table_name, keyspace_name]).catch((err) => {console.log('ERROR pineapples:', err);});
            console.log('schemaRows ' + JSON.stringify(schemaRows) + '\n'.repeat(3));

            if (schemaRows.length) {
                schemaRows.forEach(s => {
                    tableSchemaRes = {...tableSchemaRes, [s.column_name]: s.type};
                });

                schemaArr.push({...toJsonSchema(tableSchemaRes), title: table_name});

            }

            // todo: check if at least one row was found - if not - use table schema

            console.log('end of cycle');
        }

        console.log('Raw result: ', JSON.stringify(schemaArr));
        await writeFile('schema.json', JSON.stringify(schemaArr), {}, err => console.log(err))

})()

// ==============DATA FORMATTER============
// ==============END OF DATA FORMATTER============


// Exit the program after all queries are complete
Promise.allSettled([
    // q1,
    // q2,
    // q3
]).finally(() => client.shutdown());

// todo: subscribe on unhandled promise rejections event and stuff...
// todo: add graceful shutdown