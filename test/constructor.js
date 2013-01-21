/*jshint node:true */
/*global describe, it, before, after, beforeEach, afterEach */

var assert = require("assert"),
    Config = require("../lib/index.js");

describe("YUIConfig Lib", function() {
    describe("Constructor Args", function() {
        it("should accept a string & store it", function() {
            var source = "var a = 1",
                config = new Config(source);
            
            assert("_source" in config);
            assert.equal(config._source, source);
        });
        
        it("should accept an object with a `source` property & store it", function() {
            var source = "var a = 1",
                config = new Config({ source : source });
            
            assert("_source" in config);
            assert.equal(config._source, source);
        });
        
        it("should accept an object with a `file` property & store the contents", function() {
            var config = new Config({ file : "./test/specimens/basic.js" });
            
            assert("_source" in config);
            assert(config._source);
            assert(config._source.length > 0);
        });
        
        it("should throw if no input value is found", function() {
            assert.throws(function() {
                new Config();
            }, Error);
            
            assert.throws(function() {
                new Config({});
            }, Error);
            
            assert.throws(function() {
                new Config({ fooga : "booga" });
            }, Error);
        });
    });
});
