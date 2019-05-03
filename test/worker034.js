#!/usr/bin/env node
var readHelp       = require('../../jsmailbee/read/readHelpers');

var amqp = require('amqplib/callback_api');
var CLOUDAMQP_URL = process.env.CLOUDAMQP_URL || 'wtf';
//const { spawn } = require('child_process');
var CLOUDAMQP_QTASKWORKER = process.env.CLOUDAMQP_QTASKWORKER || 'task_queue';
var CLOUDAMQP_QPROCFILE   = process.env.CLOUDAMQP_QPROCFILE   || 'task_procfile';

amqp.connect(CLOUDAMQP_URL, function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q  = CLOUDAMQP_QTASKWORKER;
	var q2 = CLOUDAMQP_QPROCFILE; 

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
		console.log("themsg=", themsg);
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
			//var fileID = 
			callreadHelp_test22(url, function myCB(err, fileID) {
										console.log(`\n\t * * * * * *  myCB(${fileID})\n`);
										if (err) throw err; // Check for the error and throw if it exists.
										if (fileID.length > 10) {
											// post to taskQueue(x, fileID);
											console.log(`post to ${q2}: <tags>${fileID}<\/tags>`);
											mySendToQ(ch, q2, `<tags>${fileID}<\/tags>`);
										}
									}		
			);
			
			// console.log("Read takes some time wait 10 secs. . . . . .", (new Date()).toISOString());
			// setTimeout(function() {
				// console.log(". . . . . . OK now Ping.", (new Date()).toISOString())
				// postmanCodeReplyMail();	
			// }, 10 * 1000);		
        }
      }

      setTimeout(function() {
        console.log(" [y] Done\n Waiting. . . . . . ack");
        ch.ack(msg);
      }, .5 * 1000);
    }, {noAck: false});
  });
});

var cnt=0;
function mySendToQ(ch, q, msg) {
    //var msg = "mySend:";
    var event = new Date(Date.now());
    var now = event.toISOString()
    var ts = event.toLocaleTimeString()+' | '+event.getUTCMilliseconds();
    msg = '[' + cnt++ +'] '+now+'| '+msg;
	console.log("\t=====> ", msg);

    ch.sendToQueue(q, new Buffer(msg), {persistent: true});

}

function callreadHelp_test22(url, myCB) {
	
    console.log(`\t\t callreadHelp_test22(${url}, cb)`);
    
    var fileid = readHelp.test22(url, myCB);
	
	// setTimeout(function() {
		// console.log(". . . . . .callreadHelp_test.", (new Date()).toISOString());
	// }, 10 * 1000);
	
	var id = `id-${fileid}--${cnt}-${url}`;
	return id ;
}



function REMOVEME___postmanCodeRead(url)
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
    "cache-control": "no-cache"
    //"postman-token": "5fb9e299-2712-b68e-615c-10763edd7030"
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
	
	// post file ID to Rabbit.
	
  });
});

req.write(qs.stringify({ left: 'right', tagurl: url }));
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