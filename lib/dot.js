var es = require('event-stream');
var Stream = require('net').Stream;

exports.dot = function (target) {
    var first = true;
    var dot = es.map(function (data, map) {
        var s = first
            ? data.replace(/(^|\n)\./g, '$1..')
            : data.replace(/\n\./g, '\n..')
        ;
        first = data.charCodeAt(data.length - 1) === 10;
        map(null, s);
    });
    return es.connect(target, dot);
};

exports.undot = function (target) {
    var first = true;
    var dot = es.map(function (data, map) {
        var s = first
            ? data.replace(/(^|\n)\.\./g, '$1.')
            : data.replace(/\n\.\./g, '\n.')
        ;
        first = data.charCodeAt(data.length - 1) === 10;
        map(null, s);
    });
    
    return es.connect(dot, target);
};
