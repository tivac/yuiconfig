/*jshint node:true */
/*global describe, it, before, after, beforeEach, afterEach */

var assert = require("assert"),
    Config = require("../lib/index.js");

describe("YUIConfig Lib", function() {
    describe("basic `go` method usage", function() {
        it("should bail on invalid source", function() {
            var config = new Config({ file : "./test/specimens/invalid-config.js" });
            
            assert.throws(config.go);
        });
        
        it("should store the AST", function() {
            var config = new Config({ file : "./test/specimens/basic-config.js" });
            
            config.go();
            
            assert("_ast" in config);
            assert(config._ast);
        });
        
        it("should store the AST wrapped with traverse", function() {
            var config = new Config({ file : "./test/specimens/basic-config.js" });
            
            config.go();
            
            // TODO: this is a crappy test, but the way traverse is written we can't easily use instanceof
            assert("_traverse" in config);
            assert(config._traverse);
        });
    });
});
