var http = require('http');
var fs = require('fs');
var connect = require('connect');
var Mincer = require('mincer');

var environment = new Mincer.Environment();
environment.appendPath('app');

var postProcessor = function (path, data) {
  this.path = path;
  this.data = data;
};
postProcessor.prototype.evaluate = function(context, locals) {
  if(this.path.match(/nomodule/))
    return this.data;
  var pathArgs = this.path.split("/");
  var name = pathArgs[pathArgs.length - 1].replace(".js","");
  var data = 'this.require.define({ "'+name+'" : function(exports, require, module) {';
  data += this.data;
  data += 'module.exports = '+name+';';
  data += '}});';
  return data;
};
environment.registerPostProcessor('application/javascript', postProcessor);

var app = connect();
app.use('/assets', Mincer.createServer(environment));
app.use(function (req, res) {
  fs.readFile("./index.html", "binary", function(err, file) {
    res.writeHead(200);
    res.write(file, "binary");
    res.end();
  });
});

http.createServer(app).listen(3000);
