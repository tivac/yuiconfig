/*jshint node:true */

var fs     = require("fs"),
    util   = require("util"),
    events = require("events"),
    
    redefine = require("redefine"),
    esprima  = require("esprima"),
    traverse = require("traverse"),
    
    YUIConfig,
    Config;

// no-op, acts as a config host mostly
Config = function() {};
    
// actual library
YUIConfig = function(input) {
    var source;
    
    events.EventEmitter.call(this);
    
    if(typeof input !== "string") {
        if(input.file) {
            source = fs.readFileSync(input.file, "utf-8");
        } else if(input.source) {
            source = input.source;
        }
        
        if(!source) {
            throw new Error("No input value found");
        }
    } else {
        source = input;
    }
    
    redefine(this, {
        _source : redefine.as({
            enumerable : false,
            value      : source
        }),
        
        config : redefine.later(function() {
            return {};
        })
    });
};

util.inherits(YUIConfig, events.EventEmitter);

YUIConfig.prototype = {
    _triggers : [ "combine", "comboBase", "root" ],
    
    // dispatches to node handle fns
    _handleNode : function(o) {
        var name = "_" + o.node + "Node";
        
        if(name in this) {
            console.log(name, o.parent.parent.node); //TODO: REMOVE DEBUGGING
            
            this[name](o.parent.parent);
        }
    },
    
    _rootNode : function(o) {
        // TODO: How do we figure out if this is in a group?
        // Should just have to go up a few parents & see if there's a "groups" key I guess?
        
        //console.log(o.node); //TODO: REMOVE DEBUGGING
    },
    
    _comboBaseNode : function(o) {},
    
    _combineNode : function(o) {},
    
    go : function() {
        var self = this,
            ast = esprima.parse(this._source, {
                comment : true
            });
        
        redefine(self, {
            _ast : ast,
            _traverse : traverse(ast)
        }, {
            enumerable : false
        });
        
        //console.log("\n" + JSON.stringify(ast, null, 4)); //TODO: REMOVE DEBUGGING
        
        traverse(ast).forEach(function() {
            if(self._triggers.indexOf(this.node) > -1) {
                self._handleNode.call(self, this);
            }
        });
    }
};

module.exports = YUIConfig;
