'use strict';

describe('cloudlog.directive module', function() {
    beforeEach(module('cloudlog'));

    describe('clg-namespace directive', function() {
	it('should call cloudlog.defineNamspace()', function() {
	    var cloudlog = jasmine.createSpyObj('cloudlog', ['defineNamspace']);
	    module(function($provide) {
		$provide.factory('cloudlog', function() {
		    return cloudlog;
		});
	    });
	    inject(function($compile, $rootScope) {
		var element = $compile('<clg-namespace name="/foo" alias="foo"/>')($rootScope);
		expect(cloudlog.defineNamspace).toHaveBeenCalledWith("/foo", "foo");
	    });
	});
    });
});
