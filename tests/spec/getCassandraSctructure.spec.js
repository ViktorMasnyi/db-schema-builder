const sinon = require('sinon');
const { should } = require('should')
let { client, getDbStructure } = require('../../connectors/cassandra');

let executeSpy;
describe('Cassandra connector', function() {
    beforeEach(() => {
        executeSpy = sinon.stub().returns(Promise.resolve({
            rows: [{testRow: true, keyspace_name: 'test-keyspace', table_name: 'test-table-name'}]
        }));
        client.execute = executeSpy;

    })

    it('should get the data structure from non empty DB table', async () => {
        const res = await getDbStructure();
        res.should.be.deepEqual({
            "test-table-name": {
                "testRow": true,
                "keyspace_name": "test-keyspace",
                "table_name": "test-table-name"
            }
        });
    });
});
