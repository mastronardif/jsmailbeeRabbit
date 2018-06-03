#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var CLOUDAMQP_URL = process.env.CLOUDAMQP_URL || 'wtf';
var CLOUDAMQP_QPROCFILE = process.env.CLOUDAMQP_QPROCFILE || 'task_procfile';
//var CLOUDAMQP_QTASKWORKER = process.env.CLOUDAMQP_QPROCFILE || 'task_queue';

const { spawn } = require('child_process');

amqp.connect(CLOUDAMQP_URL, function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q =  CLOUDAMQP_QPROCFILE;

    ch.assertQueue(q, {durable: true});
    ch.prefetch(1);
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
    ch.consume(q, function(msg) {
      //var secs = msg.content.toString().split('.').length - 1;
      //console.log(" [x wtf]  (%d secs)Received %s", secs,  msg.content.toString());
      console.log(" [x wtf]  Received %s", msg.content.toString());
      if (msg.content)
      {
        var themsg = msg.content.toString();
		console.log("0themsg=", themsg);
        themsg = themsg.replace(/\s+/g, '');
		console.log("1themsg=", themsg);
        var myReg = /<tags>(.*?)<\/tags>/;
        //var myReg = /(?:^|\s)format_(.*?)(?:\s|$)/;              
        var match = myReg.exec(themsg);
		 console.log("match", match);
        if (match)
        {
            var url = match[1].trim();
			//url.replaceAll("^\\s+|\\s+$", "")
            console.log("+++++++++++\t", url);
            // Do work.  Make this sequence if you can. Cheezy
			//postmanCodeRead(url);						
			console.log("Read takes some time wait 20 secs. . . . . .", (new Date()).toISOString());
			setTimeout(function() {
				console.log(". . . . . . OK now Ping.", (new Date()).toISOString())
				//postmanCodeReplyMail();	
			}, 10 * 1000);		
        }
      }

      setTimeout(function() {
        console.log(" [y] Done\n Waiting. . . . . .");
        ch.ack(msg);
      }, .5 * 1000);
    }, {noAck: false});
  });
});

function postmanCodeRead(url)
{
var qs = require("querystring");
var http = require("http");

var options = {
  "method": "POST",
  "hostname": "localhost",
  "port": "3000",
  "path": "/read",
  "headers": {
    "content-type": "application/x-www-form-urlencoded",
    "cache-control": "no-cache",
    "postman-token": "5fb9e299-2712-b68e-615c-10763edd7030"
  }
};

var req = http.request(options, function (res) {
  var chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function () {
    var body = Buffer.concat(chunks);
    console.log("END", body.toString());
  });
});

req.write(qs.stringify({ left: 'right',
tagurl: url }));
  //tagurl: 'https://www.nytimes.com/section/opinion' }));
req.end();	
}

function postmanCodeReplyMail()
{
  var qs = require("querystring");
  var http = require("http");
  
  var options = {
    "method": "POST",
    "hostname": "localhost",
    "port": "3000",
    "path": "/replyMail",
    "headers": {
      "left": "right",
      "content-type": "application/x-www-form-urlencoded",
      "cache-control": "no-cache",
      "postman-token": "db058edc-df7b-8326-dec4-5bad24d6d305"
    }
  };
  
  var req = http.request(options, function (res) {
    var chunks = [];
  
    res.on("data", function (chunk) {
      chunks.push(chunk);
    });
  
    res.on("end", function () {
      var body = Buffer.concat(chunks);
      console.log(body.toString());
    });
  });
  
  req.write(qs.stringify({ left: 'right' }));
  req.end();
}