// this module scrapes data from cat's flat files

var fetch = require('node-fetch');

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

module.exports = fetchLogDay;
