'use strict';

describe('cloudlog.directive module', function() {
    beforeEach(module('cloudlog'));

    var cloudlog;
    beforeEach(function() {
	cloudlog = jasmine.createSpyObj('cloudlog', ['defineNamspace', 'defineConcept', 'getIndexed']);
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

    describe('clg-indexed', function(){
	it('should call cloudlog.getIndexed()', function(){
	    inject(function($compile, $rootScope) {
		var element = $compile('<clg-indexed key="myKey(7)" to="results"/>')($rootScope);
		expect(cloudlog.getIndexed).toHaveBeenCalledWith('myKey(7)', {}, $rootScope, 'results');
	    });
	});

	it('should use the assign attribute to calculate variable assignment', function(){
	    inject(function($compile, $rootScope) {
		var $scope = $rootScope.$new();
		$scope.foo = 3;
		var element = $compile('<clg-indexed key="myKey(X, Y)" to="results" assign="X:2, Y:foo"/>')($scope);
		expect(cloudlog.getIndexed.calls.argsFor(0)[1]).toEqual({X: 2, Y: 3});
	    });
	});

    });

});
