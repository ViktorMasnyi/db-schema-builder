const { client, getDbStructure } = require('./connectors/cassandra');
const { convert } = require('./converters/toJsonSchemaConverter');
const exportTo = require('./reporters/exportToFile');

(async () => {
    async function main() {
        const dbStructure = await getDbStructure();
        const schema = convert(dbStructure);
        await exportTo(schema);
    }

// Exit the program after all queries are complete
    await main()
        .catch((err) => {
            console.error(err);

            process.exit(1);
        })
        .finally( () => shutdown());
})()

// Subscribe to system signals
process.on('SIGTERM', async () => {
    console.log('[App] SIGTERM signal caught');

    await shutdown();
});

process.on('SIGINT', async () => {
    console.log('[App] SIGINT signal caught');

    await shutdown();
});

process.on('unhandledRejection', error => {
    console.log({
        type: 'UnhandledRejection',
        error: error.stack
    });
});
process.on('uncaughtException', async error => {
    console.error(error);

    await shutdown()
    console.log({
        type: 'UncaughtException',
        error: error.stack
    });
});

// Graceful shutdown
async function shutdown() {
    console.log('[App] Closing DB connections');
    await client.shutdown();

    console.log('[App] Exited');
    process.exit(0);
}