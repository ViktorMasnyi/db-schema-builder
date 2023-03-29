const Ajv = require("ajv")
const ajv = new Ajv()

module.exports = function (data, schema) {
    const validationResult = ajv.validate(schema, data);
    if (!validationResult) {
        throw new Error(`Config file is invalid:\n, ${JSON.stringify(ajv.errors)}`);
    }

    return  validationResult;
};
