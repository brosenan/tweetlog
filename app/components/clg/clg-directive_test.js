'use strict';

describe('cloudlog.directive module', function() {
    beforeEach(module('cloudlog'));

    var cloudlog;
    beforeEach(function() {
	cloudlog = jasmine.createSpyObj('cloudlog', ['defineNamspace', 'defineConcept']);
	module(function($provide) {
	    $provide.factory('cloudlog', function() {
		return cloudlog;
	    });
	});
    });

    describe('clg-namespace directive', function() {
	it('should call cloudlog.defineNamspace()', function() {
	    inject(function($compile, $rootScope) {
		var element = $compile('<clg-namespace name="/foo" alias="foo"/>')($rootScope);
		expect(cloudlog.defineNamspace).toHaveBeenCalledWith("/foo", "foo");
	    });
	});
    });

    describe('clg-define', function(){
	it('should call cloudlog.defineConcept()', function(){
	    inject(function($compile, $rootScope) {
		var element = $compile('<clg-define concept="foo(A, B, C)" alias="foo"/>')($rootScope);
		expect(cloudlog.defineConcept).toHaveBeenCalledWith("foo(A, B, C)", "foo");
	    });
	});
    });
});
