module.exports = function (stream) {
    return function (code, lines) {
        if (lines === undefined) lines = [];
        if (lines.length === 0) lines = [ '' ];
        
        if (typeof lines === 'string') lines = [ lines ];
        lines = lines.reduce(function (acc, line) {
            return acc.concat(line.split(/\r?\n/));
        }, []);
        
        lines.forEach(function (line, i) {
            stream.write(
                code
                + (i === lines.length - 1 ? ' ' : '-')
                + line
                + '\r\n'
            );
        });
    };
};
