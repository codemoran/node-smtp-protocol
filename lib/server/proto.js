var parser = require('./parser');
var EventEmitter = require('events').EventEmitter;
var Stream = require('net').Stream;
var dot = require('../dot.js').dot;

module.exports = function (stream) {
    return new Client(stream);
};

function Client (stream) {
    var self = this;
    self.stream = stream;
    self.queue = [
        function (err, code, lines) {
            if (err) self.emit('error', err)
            else self.emit('greeting', code, lines)
        }
    ];
    
    var p = parser(stream, function (err, code, lines) {
        if (self.queue.length) {
            self.queue.shift()(err, code, lines);
        }
    });
    
    return self;
}

Client.prototype = new EventEmitter;

Client.prototype.helo = function (domain, cb) {
    if (typeof domain === 'function') {
        cb = domain;
        domain = undefined;
    }
    stream.write('HELO' + (domain !== undefined ? ' ' + domain : '') + '\r\n');
    this.queue.push(cb);
};

Client.prototype.to = function (addr, ext, cb) {
    if (typeof ext === 'function') {
        cb = ext;
        ext = undefined;
    }
    stream.write(
        'RCPT TO: <' + addr + '>'
        + (ext ? ' ' + ext : '')
        + '\r\n'
    );
    this.queue.push(cb);
};

Client.prototype.from = function (addr, ext, cb) {
    if (typeof ext === 'function') {
        cb = ext;
        ext = undefined;
    }
    stream.write(
        'MAIL FROM: <' + addr + '>'
        + (ext ? ' ' + ext : '')
        + '\r\n'
    );
    this.queue.push(cb);
};

Client.prototype.data = function (cb) {
    stream.write('DATA\r\n');
    this.queue.push(cb);
};

Client.prototype.message = function (source, cb) {
    var self = this;
    
    var newline = true;
    
    dot(source).pipe(self.stream, { end : false });
    
    source.on('end', function () {
        self.stream.write('\r\n.\r\n');
    });
    
    this.queue.push(cb);
};
