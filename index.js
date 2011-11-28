var net = require('net');

var proto = exports.protocol = {
    client : require('./lib/client/proto'),
};

exports.createServer = function (domain, cb) {
    if (typeof domain === 'function') {
        cb = domain;
        domain = undefined;
    }
    
    return net.createServer(function (stream) {
        cb(proto.client(domain, stream));
    });
};

exports.createConnection = function () {
    // ...
};
