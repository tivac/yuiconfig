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
        
        // TODO: figure out how to make this work with getters
        // all the way down to individual group objects, preferably
        // otherwise we'll create a new fn to do it I guess
        config : {}
    });
};

util.inherits(YUIConfig, events.EventEmitter);

YUIConfig.prototype = {
    
    // determine if this value is under a group or the root
    _group : function(t) {
        var self = this,
            path = [],
            group;
        
        // are we under a group?
        // using some ensures we always stop at the highest "groups" property
        t.path.some(function(step, idx) {
            var el;
            
            path = path.concat(step);
            
            el = self._traverse.get(path);
            
            if(el.type !== "Property" ||
               self._traverse.get(path.concat("key")).name !== "groups") {
                return;
            }
            
            // Yes, this does look... insane
            group = self._traverse.get(
                path.concat(
                    t.path[idx + 1],
                    t.path[idx + 2],
                    t.path[idx + 3],
                    "key",
                    "value"
                )
            );
            
            return true;
        });
        
        return group;
    },
    
    _nodes : [ "combine", "comboBase", "root" ],
    
    _node : function(type, t) {
        var group = this._group(t),
            value = this._traverse.get(t.path.concat("value", "value"));
        
        if(group) {
            // needs some magic to enable this to either a) be as easy as the root case
            // or b) go through some sort of wrapper function to ensure group existence
            // see comment on line #43
            //this.config.groups[group][type] = value;
        } else {
            this.config[type] = value;
        }
    },
    
    
    // Public API
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
            if(self._nodes.indexOf(this.node) > -1) {
                self._node.call(self, this.node, this.parent.parent);
            }
        });
        
        console.log(JSON.stringify(this.config)); //TODO: REMOVE DEBUGGING
    }
};

module.exports = YUIConfig;
