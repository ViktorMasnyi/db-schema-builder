module.exports = {
  "type": "object",
  "properties": {
    "contactPoints": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "localDataCenter": {
      "type": "string"
    },
    "userName": {
      "type": "string"
    },
    "password": {
      "type": "string"
    },
    "sysKeyspaceNames": {
      "type": "object",
      "properties": {
        "system_schema": {
          "type": "boolean"
        },
        "system_auth": {
          "type": "boolean"
        },
        "system_distributed": {
          "type": "boolean"
        },
        "system": {
          "type": "boolean"
        },
        "system_traces": {
          "type": "boolean"
        }
      }
    }
  },
  "required": [
      "contactPoints",
      "localDataCenter",
      "userName",
      "password",
      "sysKeyspaceNames",
  ],
  "additionalProperties": false
}