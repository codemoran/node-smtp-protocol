var test = require('tap').test;
var parser = require('../lib/parser');

var chunky = require('chunky');
var Stream = require('net').Stream;

test('multi-line code parsing', function (t) {
    for (var i = 0; i < 1; i++) {
        var stream = new Stream;
        var output = [];
        
        parser(stream, function (err, code, lines) {
            if (err) t.fail(err);
            output.push([ code, lines ]);
        });
        
        var chunks = chunky(new Buffer([
            '100 single',
            '200-one',
            '200-two',
            '200 three',
            '45 beep',
            '50 boop',
            ''
        ].join('\r\n')));
        
        var iv = setInterval(function () {
            var c = chunks.shift();
            if (c) stream.emit('data', c)
            if (chunks.length === 0) {
                clearInterval(iv);
                t.deepEqual(output, [
                    [ 100, [ 'single' ] ],
                    [ 200, [ 'one', 'two', 'three' ] ],
                    [ 45, [ 'beep' ] ],
                    [ 50, [ 'boop' ] ],
                ]);
                t.end();
            }
        }, 10);
    }
});
