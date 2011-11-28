var parser = require('./parser');
var writer = require('../server/write');
var Stream = require('net').Stream;
var os = require('os');
var EventEmitter = require('events').EventEmitter;

module.exports = function (domain, stream) {
    if (stream === undefined) {
        stream = domain;
        domain = undefined;
    }
    
    var p = parser(stream);
    var write = writer(stream);
    write(250, domain || os.hostname());
    
    var req = new EventEmitter;
    
    (function next () {
        p.getCommand(function (err, cmd) {
            if (err) {
                if (err.code) write(err.code, err.message || err.toString())
                else write(501, err.message || err.toString())
                next();
            }
            else if (cmd.name === 'quit') {
                write(221, 'Bye!');
                stream.end();
            }
            else if (!req.greeting) {
                if (cmd.name === 'greeting') {
                    req.greeting = cmd.greeting;
                    req.domain = cmd.domain;
                }
                else write(503, 'Bad sequence: HELO, EHLO, or LHLO expected.')
                next();
            }
            else if (cmd.name === 'mail') {
                var fromAck = function (code, msg) {
                    if (code === undefined) code = 250;
                    if (code.toString().match(/^2\d{2}\b/)) {
                        req.from = cmd.from;
                    }
                    write(code, msg || '');
                    next();
                };
                if (req.listeners('from').length === 0) fromAck();
                req.emit('from', cmd.from, fromAck);
            }
            else if (cmd.name === 'rcpt') {
                var toAck = function (code, msg) {
                    if (code === undefined) code = 250;
                    if (code.toString().match(/^2\d{2}\b/)) {
                        req.to = cmd.to;
                    }
                    write(code, msg || '');
                    next();
                };
                if (req.listeners('to').length === 0) toAck();
                req.emit('to', cmd.to, toAck);
            }
            else if (cmd.name === 'data') {
                if (!req.to) {
                    write(503, 'Bad sequence: MAIL expected');
                    next();
                }
                else if (!req.from) {
                    write(503, 'Bad sequence: RCPT expected');
                    next();
                }
                else {
                    var target = new Stream;
                    target.readable = true;
                    target.writable = false;
                    target.write = function (buf) { target.emit('data', buf) };
                    target.end = function (buf) {
                        if (buf !== undefined) target.write(buf);
                        target.emit('end')
                    };
                    var dataAck = function (code, msg) {
                        if (code === undefined || code === 354) {
                            write(354, msg || '');
                            p.getUntil('.', target);
                            target.on('end', next);
                        }
                    };
                    req.emit('data', target, dataAck);
                }
            }
        });
    })();
    
    return req;
};
