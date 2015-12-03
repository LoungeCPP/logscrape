var fetch = require('node-fetch');
var http = require('http');
var https = require('https');
var Handlebars = require("handlebars");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// pads a number with leading zeros or chars
function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function fetchLogDay(date) {
    var dateStr = date.getFullYear() + '-' + pad(date.getMonth()+1, 2) + '-' + pad(date.getDate(), 2);
    var logUrl = dateStr + '.log';

    console.log('making a req on ' + logUrl);

    var username = "logs";
    var passw = "andaaaawaywego";

    return fetch('https://irc.loungecpp.net/' + logUrl, {
        method: 'GET',
        headers: { 'Authorization': 'Basic ' + new Buffer(username + ':' + passw).toString('base64') }
    }).then(function(res) {
        console.log('got a response');
        return res.text();
    }).catch(function(e) {
        console.log(e);
    });
}

function logDayToHtml() {
    var source = 
        ["<table>"
        ,"{{#messages}}"
        ,"    <tr>"
        ,"        <td>{{timestamp}}</td>"
        ,"        <td>{{user}}</td>"
        ,"        <td>{{text}}</td>"
        ,"    </tr>"
        ,"{{/messages}}"
        ,"</table>"
        ].join('\n');
    var template = Handlebars.compile(source);

    return fetchLogDay(new Date())
    .then(function (logs) {
        console.log('got logs');
        return logs.split('\n').map(function(log) {
            var msgRegex = /^\[(.*)\] <(.*)> (.*)$/
            var result = log.match(msgRegex);
            if (!result)
                return null;

            var logMessage = {
                timestamp: result[1],
                user: result[2],
                text: result[3]
            };

            return logMessage;
        }).filter(function(x) { return x });
    })
    .then(function(messages) {
        console.log('got html');        
        var html = template({messages: messages});
        return html;
    }).catch(function(e) {
        console.log(e);
    });
}

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});

    console.log('req on ' + req.url);
    logDayToHtml().then(function(html) {
        console.log('done');
        res.end(html)
    });

}).listen(process.env.PORT || 8181);

