module.exports = function (stream, cb) {
    return new Parser(stream, cb);
};

function Parser (stream, cb) {
    this.stream = stream;
    this.bytes = 0;
    this.target = null;
    
    this.parseLines(cb);
}

Parser.prototype.getBytes = function (n, target) {
    this.bytes = n;
    this.target = target;
};

Parser.prototype.parseLines = function (cb) {
    var self = this;
    var continuation = null;
    
    self.parseData(function (line) {
        var m = line.match(/^(\d+)([- ])(.+)$/);
        var code = m && parseInt(m[1], 10);
        
        if (!m) {
            cb('syntax error');
        }
        else if (continuation) {
            if (code !== continuation.code) {
                cb('inconsistent code in line continuation');
            }
            else {
                continuation.lines.push(m[3]);
                if (m[2] === ' ') {
                    cb(null, continuation.code, continuation.lines);
                    continuation = null;
                }
            }
        }
        else if (m[2] === '-') {
            continuation = { code : code, lines : [ m[3] ] };
        }
        else {
            cb(null, code, [ m[3] ]);
        }
    });
}

Parser.prototype.parseData = function (cb) {
    var self = this;
    var line = '';
    
    self.stream.on('data', function ondata (buf, offset) {
        if (offset === undefined) offset = 0;
        
        if (self.bytes) {
            var ix = Math.min(buf.length, offset + self.bytes);
            var chunk = buf.slice(offset, ix);
            self.target.write(chunk);
            
            self.bytes -= chunk.length;
            if (self.bytes === 0) {
                if (buf.length > offset + chunk.length) {
                    ondata(buf, offset + chunk.length);
                }
                self.target.end();
            }
        }
        else {
            for (var i = offset; i < buf.length; i++) {
                if (buf[i] === 10) {
                    cb(line.replace(/\r$/, ''));
                    line = '';
                    if (buf.length > i + 1) ondata(buf, i + 1);
                    break;
                }
                else line += String.fromCharCode(buf[i])
            }
        }
    });
}
