module.exports = {
    contactPoints: ["localhost"],
    localDataCenter: "datacenter1",
    userName: "cassandra",
    password: "cassandra",
    sysKeyspaceNames: {
        "system_schema": true,
        "system_auth": true,
        "system_distributed": true,
        "system": true,
        "system_traces": true
    }
};
