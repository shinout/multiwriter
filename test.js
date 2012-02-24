var fs = require('fs');
var mwriter = require('multiwriter').create({
  stdout: process.stdout,
  file1 : "file1",
  file2 : "file2"
}, {interval: 300 });

mwriter.on("close", function() {
  var w  = written.join("\n") + "\n";
  var w1 = writtenFile1.join("\n") + "\n";
  console.assert(fs.readFileSync("file2", "utf8") == w);
  console.assert(fs.readFileSync("file1", "utf8") == w1);
  fs.unlinkSync("file1");
  fs.unlinkSync("file2");
});

var written = [];
var writtenFile1 = [];

for (var i=1; i<=100000; i++) {
  mwriter.write(i + "\n");
  written.push(i);
  mwriter.file1.write(i + "\n");
  writtenFile1.push(i);
  writtenFile1.push(i);
}

mwriter.end(); // all writer ends
