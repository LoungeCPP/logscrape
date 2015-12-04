var http = require('http');
var https = require('https');
var Handlebars = require("handlebars");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var scrapeCatLogs = require('./catscrape');


function logDayToMessages(date) {
    return scrapeCatLogs(date)
    .then(function (logs) {
        console.log('got logs');
        return logs.split('\n').map(function(log) {
            var msgRegex = /^\[(.*?)\] <(.*?)> (.*)$/
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
    });
}

function todayToHtml() {
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

    return logDayToMessages(new Date())
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
    todayToHtml().then(function(html) {
        console.log('done');
        res.end(html)
    });

}).listen(process.env.PORT || 8181);

