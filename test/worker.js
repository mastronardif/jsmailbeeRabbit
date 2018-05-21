#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var CLOUDAMQP_URL = process.env.CLOUDAMQP_URL || 'wtf';

amqp.connect(CLOUDAMQP_URL, function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q = 'task_queue';

    ch.assertQueue(q, {durable: true});
    ch.prefetch(1);
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
    ch.consume(q, function(msg) {
      var secs = msg.content.toString().split('.').length - 1;

      console.log(" [x]  (%d secs)Received %s", secs,  msg.content.toString());
      setTimeout(function() {
        console.log(" [x] Done");
        ch.ack(msg);
      }, secs * 1000);
    }, {noAck: false});
  });
});