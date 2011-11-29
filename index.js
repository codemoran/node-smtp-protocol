var net = require('net');

var proto = exports.protocol = {
    client : require('./lib/client/proto'),
    server : require('./lib/server/proto'),
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

exports.connect = function (port, host, cb) {
    if (typeof port === 'string' && typeof host === 'number') {
        var host_ = port, port_ = host;
        host = host_, port = port_;
    }
    if (typeof host === 'function') {
        cb = host;
        host = 'localhost';
    }
    
    var stream = net.createConnection(port, host, function () {
        cb(proto.server(stream));
    });
    return stream;
};
