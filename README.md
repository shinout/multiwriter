multiwriter
==========
WritableStream to write to multi-WritableStreams. [Node.js]

## Installation ##

    $ npm install multiwriter 

    OR

    $ git clone git://github.com/shinout/multiwriter.git

## sample ##

    var mwriter = require('multiwriter').create({
      stdout: process.stdout,
      file1 : "file1",
      file2 : "file2"
    });

    mwriter.write("this is written to all writable streams\n");

    mwriter.stdout.write("this is written only to process.stdout\n");

    mwriter.end(); // all writer ends
    mwriter.on("close", function() {
      console.log("all writers are closed instead of process.stdout.");
    }); // all writer ends

## API Documentation ##

MultiWriter implements interface of WritableStream.

See [Node.js#Stream](http://nodejs.org/docs/latest/api/streams.html#writable_Stream) for WritableStream's API.

- MultiWriter.create(source, options)
- writer[name]

### MultiWriter.create(obj, options) ###

Creates an instance of MultiWriter.

**obj** is the pairs of key - values to register child writable streams.

**key** is the name of a child writable stream.

**value** is one of the followings.

- filename (string)  : filename to write.
- wstream  (WritableStream) instance of WritableStream.

(Object) **options** is optional.


<table>
<tr><th>key</th>
<td>type</td>
<td>description</td>
<td>example</td></tr>

<tr><th>interval</th>
<td>integer</td>
<td>the interval to write data. default 0 (writes every time)<br>
</td>
<td>100</td></tr>

</table>

    var mwriter = require('multiwriter').create({
      stdout: process.stdout,
      file1 : "file1",
      file2 : "file2"
    }, {interval: 300 });

### writer[name] ###
We can access child writable streams.

    var mwriter = require('multiwriter').create({
      stdout: process.stdout,
      file1 : "file1",
      file2 : "file2"
    }, {interval: 300 });

    mwriter.file1.write("this is written only to file1");
