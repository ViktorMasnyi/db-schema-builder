-- Create a keyspace
CREATE KEYSPACE IF NOT EXISTS store WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : '1' };

-- Create the custom type
CREATE TYPE store.address (
    userid text,
    residence_address text,
    city text
    );

-- Create a table
CREATE TABLE IF NOT EXISTS store.shopping_cart (
                                                   userid text PRIMARY KEY,
                                                   item_count int,
                                                   last_update_timestamp timestamp,
                                                   data text,
                                                   address frozen<address>
);

CREATE TABLE IF NOT EXISTS store.shopping_cart_empty (
                                                         userid text PRIMARY KEY,
                                                         item_count int,
                                                         last_update_timestamp timestamp,
                                                         data text
);

-- Insert some data
INSERT INTO store.shopping_cart
(userid, item_count, last_update_timestamp)
VALUES ('9876', 2, toTimeStamp(now()));
INSERT INTO store.shopping_cart
(userid, item_count, last_update_timestamp)
VALUES ('1234', 5, toTimeStamp(now()));
INSERT INTO store.shopping_cart
(userid, item_count, last_update_timestamp, data)
VALUES ('1111', 5, toTimeStamp(now()), '{"test":{"innerTest":true}}');

INSERT INTO store.shopping_cart JSON '{"userid":"5555",
  "item_count":33,
  "address":{"userid":"5555","residence_address":"65A Block","city":"Goa"}
}';