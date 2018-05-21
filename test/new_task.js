#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var CLOUDAMQP_URL = process.env.CLOUDAMQP_URL || 'wtf';

amqp.connect(CLOUDAMQP_URL, function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q = 'task_queue';
    var msg = process.argv.slice(2).join(' ') || "Hello World!";

    ch.assertQueue(q, {durable: true});
    ch.sendToQueue(q, new Buffer(msg), {persistent: true});
    console.log(" [x] Sent '%s'", msg);

    ch.sendToQueue(q, new Buffer(msg+".aaa"), {persistent: true});
    ch.sendToQueue(q, new Buffer(msg+"..bbb"), {persistent: true});
    ch.sendToQueue(q, new Buffer(msg+"...ccc"), {persistent: true});
  });
  setTimeout(function() { conn.close(); process.exit(0) }, 500);
});