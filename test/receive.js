#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var CLOUDAMQP_URL = process.env.CLOUDAMQP_URL || 'wtf';

amqp.connect(CLOUDAMQP_URL, function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q = 'hello';

    ch.assertQueue(q, {durable: false});
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
    ch.consume(q, function(msg) {
      console.log(" [x] Received %s", msg.content.toString());
    }, {noAck: true});
  });
});