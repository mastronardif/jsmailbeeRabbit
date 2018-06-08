#!/usr/bin/env node
var fs = require('fs');
var amqp = require('amqplib/callback_api');
var CLOUDAMQP_URL = process.env.CLOUDAMQP_URL || 'wtf';
var CLOUDAMQP_QPROCFILE = process.env.CLOUDAMQP_QPROCFILE || 'task_procfile';
//var CLOUDAMQP_QTASKWORKER = process.env.CLOUDAMQP_QPROCFILE || 'task_queue';
var outputType = {outType: 'file', path: './uploads/'};

const { spawn } = require('child_process');



global.config = {};//for Heroku require('./config/default.json');
const KconfigFN = './config/default.json';
if (fs.existsSync(KconfigFN)) {
  global.config = require(KconfigFN);
}
else {
  global.config = {};
  global.config.Mg = {
    "api_key": (process.env.Mg__api_key || 'wtf'),
    "domain": "joeschedule.mailgun.org"  
  };
  global.config.Admin = {
  "mail": "mastronardif@gmail.com",
  "subject": "jsmailbee test 101.",
  "fromAdmin": "mastronardif@gmail.com",
  "toAdmin": "mastronardif@gmail.com"
  };
}

var mg = global.config.Mg;
var admin = global.config.Admin;

var mailgun = require('mailgun-js')({apiKey: mg.api_key, domain: mg.domain});

//console.log(global.config); 

var g_test = {};
g_test.useMG = true;








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
            var id = match[1].trim();
            console.log("+++++++++++\t", id);
            // Do work.  Make this sequence if you can. Cheezy
			processFile(id);						
        }
      }
	  
      setTimeout(function() {
        console.log(" [y] Done\n Waiting. . . . . .");
        ch.ack(msg);
      }, .5 * 1000);
    }, {noAck: false});
  });
});

function processFile(id)
{
	console.log(`\t process file ${id}`);
	
	var fn = `${outputType.path}${id}.html`;
	console.log(fn);
	
	var buffer;
	buffer = fs.readFileSync(fn,'utf8');
	mailFile(fn);
	
	console.log(buffer);	
	
	return;
}

function mailFile(fn) {
  //var filename = "wtf.jpg";
  // for each file
  //var attch = new mailgun.Attachment({data: file, filename: filename});

  //console.log('\n\n mailStore file = \n', file); 

  var data = {
    from: admin.fromAdmin,
    to: admin.toAdmin,
    subject: admin.subject,
    //text: 'Testing some Mailgun awesomness!',
    //html: htm,
    //attachment: file
    //attachment: attch //[attch,attch] 
    //inline: file
  };



var html = fs.readFileSync(fn).toString(); 
//console.log("html=", html);
//
if (g_test.useMG) {
  data.html = html || 'Something went wrong. :( with the fs.read ,aybe a timing issue....';

  mailgun.messages().send(data, function (error, body) {
    if (error) {
      console.log('error = ', error);
    }
    else {
      console.log(body);
	  fs.unlinkSync(fn);
    }
  });
} // end debug
else {
    console.log('not doing MG\n'+html);
}

}
