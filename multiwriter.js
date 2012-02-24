var fs = require('fs');
var EventEmitter = require('events').EventEmitter;

function Writer(wstream, name, multiWriter, options) {
  options || (options = {});
  this._mwriter = multiWriter;
  this._wstream = wstream;
  this._writable = true;
  this._buffs = [];
  this._interval = (typeof options.interval == 'number') ? parseInt(options.interval) : 0;
  this._ended = false;
  this._i = 0;

  var self = this;
  this._wstream.on('drain', function() {
    self.emit('drain');
    self._writable = true;
    // self._mwriter.emit(name + '.drain');
    self.write();
  });

  this._wstream.on('error', function(e) {
    self.emit('error', e);
    self._mwriter.emit('error', e);
  });

  this._wstream.on('close', function() {
    self.emit('close');
    var mwriter = self._mwriter;
    // mwriter.emit(name + '.close');
    if (++mwriter.__privates.closed >= mwriter._names.length) {
      mwriter.emit('close');
    }
  });

  this._wstream.on('pipe', function() {
    self.emit('pipe');
    // self._mwriter.emit(name + '.pipe');
  });

  if (this._wstream === process.stdout) {
    this._mwriter.__privates.closed++; // as process.stdout cannot be closed.
  }
};

Writer.prototype = new EventEmitter;

Writer.prototype.write = function(data) {
  if (this._i >= this._interval && this._writable && !this._ended) {
    Writer._write.call(this, data);
  }
  if (data != undefined) {
    this._buffs[this._i] = data;
    this._i++;
  }
};

Writer._write = function() {
  var dataToWrite = join(this._buffs);
  if (dataToWrite != null) {
    this._writable = this._wstream.write(dataToWrite);
  }
  this._i = 0;
  this._buffs = [];
};

Writer.prototype.end = function() {
  if (this._ended) return;

  if (this._i > 0) {
    Writer._write.call(this);
  }

  if (this._wstream === process.stdout) {
    this._ended = true;
    return;
  }
  this._wstream.end();
  this._ended = true;
};

["destroy", "destroySoon"].forEach(function(methodName) {
  Writer.prototype[methodName] = function() {
    this._wstream[methodName]();
  };
});

function MultiWriter(obj, options) {
  this.writable = true;

  if (typeof obj != "object") throw new Error("argument must be an object");

  options || (options = {});
  this._names = Object.keys(obj);

  this.__privates = {
    closed : 0
  };

  this._names.forEach(function(name) {
    if (name in this) throw new Error("cannot set " + name);
    var stream = obj[name];
    if (typeof stream == 'string') {
      stream = fs.createWriteStream(stream);
    }
    this[name] = new Writer(stream, name, this, options);
  }, this);


}

MultiWriter.create = function(obj, options) {
  return new MultiWriter(obj, options);
};

MultiWriter.prototype = new EventEmitter;

["write", "end", "destroy", "destroySoon"].forEach(function(methodName) {
  MultiWriter.prototype[methodName] = function() {
    var args = arguments;
    this._names.forEach(function(name) {
      var writer = this[name];
      writer[methodName].apply(this[name], args);
    }, this);
    return true;
  };
});


function join(arr) {
  if (!arr.length) return null;
  if (Buffer.isBuffer(arr[0])) {
    var bufs = arr;
    var buffer, length = 0, index = 0;

    if (!Array.isArray(bufs)) {
      bufs = Array.prototype.slice.call(arguments);
    }
    for (var i=0, l=bufs.length; i<l; i++) {
      buffer = bufs[i];
      if (!Buffer.isBuffer(buffer)) {
        buffer = bufs[i] = new Buffer(buffer);
      }
      length += buffer.length;
    }
    buffer = new Buffer(length);

    bufs.forEach(function (buf, i) {
      buf = bufs[i];
      buf.copy(buffer, index, 0, buf.length);
      index += buf.length;
      delete bufs[i];
    });

    return buffer;
  }
  else {
    return arr.join('');
  }
}

MultiWriter.join = join;
MultiWriter.Writer = Writer;

module.exports = MultiWriter;
