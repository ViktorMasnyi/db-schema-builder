const toJsonSchema = require('to-json-schema');

module.exports.convert = function (data = {}) {
    let schemaArr = [];
    for (const [tableName, tableStructure] of Object.entries(data)) {
        const options = {
            postProcessFnc: (type, schema, value, defaultFunc) => {
                if (type === 'string' && value.startsWith('{')) {
                    try {
                        const parsedValue = JSON.parse(value);

                        return defaultFunc("object", toJsonSchema(parsedValue), parsedValue);
                    } catch (e) {
                        console.log('JSON parse err ', e);
                    }
                }
                return defaultFunc(type, schema, value);
            }
        }
        schemaArr.push({...toJsonSchema(tableStructure, options), title: tableName});
    }

    return schemaArr;
}
