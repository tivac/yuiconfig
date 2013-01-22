/*jshint node:true */

var fs     = require("fs"),
    
    redefine = require("redefine"),
    esprima  = require("esprima"),
    traverse = require("traverse"),
    _        = require("lodash"),
    
    YUIConfig,
    Config;

// no-op, acts as a config host mostly
Config = function() {};
    
// actual library
YUIConfig = function(input) {
    var source;
    
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
    
    // set up instance vars using redefine to wrap Object.defineProperties
    redefine(this, {
        _source : redefine.as({
            value : source
        }),
        
        _config : redefine.as({
            value : {}
        }),
        
        _ast      : null,
        _traverse : null,
        
        config : redefine.as({
            value : {}
        })
    }, {
        enumerable : false,
        writable   : true
    });
};

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
        var self  = this,
            group = self._group(t),
            value = self._traverse.get(t.path.concat("value", "value"));
        
        if(group) {
            // needs some magic to enable this to either a) be as easy as the root case
            // or b) go through some sort of wrapper function to ensure group existence
            // see comment on line #43
            //self.config.groups[group][type] = value;
        } else {
            redefine(self.config, type, redefine.as({
                get : function() {
                    var value = self._config[type];
                    
                    if(typeof value === "object") {
                        value = _.clone(value, true);
                    }
                    
                    return value;
                },
                
                set : function(newVal) {
                    self._config[type] = newVal;
                }
            }));
            
            self.config[type] = value;
        }
    },
    
    
    // Public API
    go : function() {
        var self = this,
            ast = esprima.parse(this._source, {
                comment : true
            });
        
        self._ast = ast;
        self._traverse = traverse(ast);
        
        //console.log("\n" + JSON.stringify(ast, null, 4)); //TODO: REMOVE DEBUGGING
        
        self._traverse.forEach(function() {
            if(self._nodes.indexOf(this.node) > -1) {
                self._node.call(self, this.node, this.parent.parent);
            }
        });
        
        console.log("\n"); //TODO: REMOVE DEBUGGING
        console.log(JSON.stringify(this._config)); //TODO: REMOVE DEBUGGING
        console.log(JSON.stringify(this.config)); //TODO: REMOVE DEBUGGING
    }
};

module.exports = YUIConfig;
