const { writeFile } = require('fs');

module.exports = async function (data) {
    return writeFile(
        'schema.json',
        JSON.stringify(data),
        {},
        err => err && console.log(`Filed to write to file:\n ${err.message}\n ${err.stack}`))
};
