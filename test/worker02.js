#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var CLOUDAMQP_URL = process.env.CLOUDAMQP_URL || 'wtf';
const { spawn } = require('child_process');

amqp.connect(CLOUDAMQP_URL, function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q = 'task_queue';

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
        themsg = themsg.replace(/\s/g, '');
        var myReg = /<tag>(.*?)<\/tag>/g;
        //var myReg = /(?:^|\s)format_(.*?)(?:\s|$)/;              
        var match = myReg.exec(themsg);
        if (match)
        {
            var url = match[1];
            console.log("\t", url);
            // Do work
            //const ls = spawn('ls', ['-lh', '/usr']);
            //const ls = spawn('ls', ['-lh', './']);
            //const ls = spawn('ls', ['-tlra', './read/read03.js']);
            const ls = spawn('node', ['./read/read03.js', url]);
            //const ls = spawn('node', ['-v']);
            ls.stdout.on('data', (data) => {
              console.log(`stdout: ${data}`);
            });

            ls.stderr.on('data', (data) => {
              console.log(`stderr: ${data}`);
            });
            ls.on('close', (code) => {
              console.log(`child process exited with code ${code}`);
              if (code==0) {
                console.log(`Holly shit lets ping the carp`);
                // postman 
                postmanCode();
              }
            });
        }


      }

      setTimeout(function() {
        console.log(" [y] Done\n Waiting. . . . . .");
        ch.ack(msg);
      }, .5 * 1000);
    }, {noAck: false});
  });
});

function postmanCode()
{
  var qs = require("querystring");
  var http = require("http");
  
  var options = {
    "method": "POST",
    "hostname": "localhost",
    "port": "3000",
    "path": "/ping",
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