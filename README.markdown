smtp-protocol
=============

Implements the smtp protocol for clients and servers.

This module does not relay any messages or perform disk I/O by itself.

examples
========

server
------

``` js
var smtp = require('smtp-protocol');

var server = smtp.createServer(function (req) {
    req.on('to', function (to, ack) {
        var domain = to.split('@')[1] || 'localhost';
        if (domain === 'localhost') ack.accept()
        else ack.reject()
    });
    
    req.on('message', function (stream, ack) {
        console.log('from: ' + req.from);
        console.log('to: ' + req.to);
        
        stream.pipe(process.stdout, { end : false });
        ack.accept();
    });
});

server.listen(9025);
```

usage:

```
$ node example/server.js 
```

elsewhere:

```
$ nc localhost 9025
250 beep
helo
250 
mail from: <beep@localhost>
250 
rcpt to: <boop@localhost>
250 
data
354 
Beep boop.
I am a computer.
.
250 
quit
221 Bye!
```

meanwhile:

```
from: beep@localhost
to: boop@localhost
Beep boop.
I am a computer.
```

methods
=======

var smtp = require('smtp-protocol')

smtp.createServer(domain=os.hostname(), cb)
-------------------------------------------

Return a new `net.Server` so you can `.listen()` on a port.

`cb(req)` fires for new connection. See the "requests" section below.

smtp.createConnection(...)
--------------------------

Not yet implemented.

requests
========

events
------

Every event that can 

Every acknowledgeable event except "message" will implicitly call `ack.accept()`
if no listeners are registered.

If there are any listeners for an acknowledgeable event, exactly one listener
MUST call either `ack.accept()` or `ack.reject()`.

### 'greeting', cmd, ack

Emitted when `HELO`, `EHLO`, or `LHLO` commands are received.

Read the name of the command with `cmd.greeting`.
Read the optional domain parameter with `cmd.domain`.

### 'from', from, ack

Emitted when the `MAIL FROM:` command is received.

`from` is the email address of the sender as a string.

### 'to', to, ack

Emitted when the `RCPT TO:` command is received.

`to` is the email address of the recipient as a string.

### 'message', stream, ack

Emitted when the `DATA` command is received.

If the message request is accepted, the message body will be streamed through
`stream`.

This event has no implicit `ack.accept()` when there are no listeners.

### 'received', ack

Emitted when the body after the `DATA` command finishes.

properties
----------

### req.from

The email address of the sender as a string.

### req.fromExt

Extended sender data if sent as a string.

### req.to

The email address of the recipient as a string.

### req.toExt

Extended recipient data if sent as a string.

### req.greeting

The greeting command. One of `'helo'`, `'ehlo'`, or `'lhlo'`.

### req.domain

The domain specified in the greeting.

acknowledgements
================

Many request events have a trailing `ack` parameter.

If there are any listeners for an acknowledgeable event, exactly one listener
MUST call either `ack.accept()` or `ack.reject()`.

ack.accept(code=250, message)
-----------------------------

Accept the command. Internal staged state modifications from the command are executed.

ack.reject(code, message)
-------------------------

Reject the command. Any staged state modifications from the command are discarded.

install
=======

With [npm](http://npmjs.org) do:

    npm install smtp-protocol
