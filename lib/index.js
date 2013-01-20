/*jshint node:true */

var util   = require("util"),
    events = require("events"),
    YUIConfig;
    
YUIConfig = function() {
    events.EventEmitter.call(this);
};

YUIConfig.prototype = {
    //TODO: ?
};

util.inherits(YUIConfig, events.EventEmitter);
