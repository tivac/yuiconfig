/*jshint node:true */
/*global describe, it, before, after, beforeEach, afterEach */

var assert = require("assert"),
    Config = require("../lib/index.js"),
    
    file   = "./test/specimens/single-group-config.js";

describe("YUIConfig Lib", function() {
    describe.only("`go` on a config with a single group", function() {
        
        beforeEach(function() {
            this.config = new Config({ file : file });
        });
        
        afterEach(function() {
            this.config = null;
        });
        
        it("should correctly identify keys at the root level", function() {
            this.config.go();
        });
        
        it("should correctly identify keys per group");
    });
});
