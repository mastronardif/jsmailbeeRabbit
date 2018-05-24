#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var CLOUDAMQP_URL = process.env.CLOUDAMQP_URL || 'wtf';

amqp.connect(CLOUDAMQP_URL, function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q = 'task_queue';
    var msg = process.argv.slice(2).join(' ') || "Hello World!";
    var event = new Date(Date.now());
    var now = event.toISOString()
    msg = now+': '+msg;

    ch.assertQueue(q, {durable: true});
    ch.sendToQueue(q, new Buffer(msg), {persistent: true});
    console.log(" [x] Sent '%s'", msg);

    mySend(ch, q, 'TEST a ');
    //mySend(ch, q, 'TEST b ');
    //mySend(ch, q, 'TEST c ');

    setInterval(function() {
        mySend(ch, q, 'TEST z ');
      }, 1000);
  });

  setTimeout(function() { conn.close(); process.exit(0) },10000);
});
console.log('++++++++++++++++++++++++++++++');
var cnt=1;
function mySend(ch, q, msg) {
    //var msg = "mySend:";
    var event = new Date(Date.now());
    var now = event.toISOString()
    var ts = event.toLocaleTimeString()+' | '+event.getUTCMilliseconds();
    msg = '[' + cnt++ +'] '+now+'| '+msg;

    ch.sendToQueue(q, new Buffer(msg+".aaa"), {persistent: true});

}