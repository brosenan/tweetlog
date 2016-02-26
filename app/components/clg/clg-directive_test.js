'use strict';

describe('cloudlog.directive module', function() {
    beforeEach(module('cloudlog'));

    var cloudlog;
    beforeEach(function() {
	cloudlog = jasmine.createSpyObj('cloudlog', ['defineNamspace', 'defineConcept', 'getIndexed', 'addAxioms', 'query']);
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
		var element = $compile('<clg-indexed key="ns:myKey(7)" to="results"/>')($rootScope);
		expect(cloudlog.getIndexed).toHaveBeenCalledWith('ns:myKey(7)', {}, $rootScope, 'results');
	    });
	});

	it('should use the assign attribute to calculate variable assignment', function(){
	    inject(function($compile, $rootScope) {
		var $scope = $rootScope.$new();
		$scope.foo = 3;
		var element = $compile('<clg-indexed key="ns:myKey(X, Y)" to="results" assign="X:2, Y:foo"/>')($scope);
		expect(cloudlog.getIndexed.calls.argsFor(0)[1]).toEqual({X: 2, Y: 3});
	    });
	});
    });
    describe('clg-query', function(){
	it('should call cloudlog.query()', function(){
	    inject(function($compile, $rootScope) {
		var element = $compile('<clg-query goal="ns:myGoal(X, Y)" to="results" assign="X:3"/>')($rootScope);
		expect(cloudlog.query).toHaveBeenCalledWith('ns:myGoal(X, Y)', {X:3}, $rootScope, 'results');
	    });
	});
    });

    describe('clg-fact', function(){
	it('should add a function named add_<name>() that calls cloudlog.addAxioms() to the scope', function(){
	    inject(function($compile, $rootScope) {
		var $scope = $rootScope.$new();
		var element = $compile('<clg-fact pattern="ns:myFact(1, 2, 3)" name="myFact"/>')($scope);
		expect(typeof $scope.add_myFact).toBe('function');

		$scope.add_myFact();
		expect(cloudlog.addAxioms).toHaveBeenCalledWith("ns:myFact(1, 2, 3)", [{}]);
	    });
	});
	it('should take the data to be added from the assign attribute', function(){
	    inject(function($compile, $rootScope) {
		var $scope = $rootScope.$new();
		$scope.two = "two";
		var element = $compile('<clg-fact pattern="ns:myFact(X, Y, Z)" name="myFact" assign="X:1, Y: two, Z: 2+1"/>')($scope);

		$scope.add_myFact();
		expect(cloudlog.addAxioms.calls.argsFor(0)[1]).toEqual([{X: 1, Y: "two", Z: 3}]);
	    });
	});
    });
    describe('clg-concept', function(){
	it('should use the name of a template as an alias for a concept', function(){
	    inject(function($compile, $rootScope) {
		var element = $compile('<script type="ng-template" id="foo-template" clg-concept="foo(A, B, C)">This is a Foo template</script>')($rootScope);
		expect(cloudlog.defineConcept).toHaveBeenCalledWith('foo(A, B, C)', 'foo-template');
	    });
	});
    });
    describe('clg-apply-template', function(){
	it('should expand the template matching the term in the scope', function(){
	    inject(function($compile, $rootScope, cloudlog, $templateCache) {
		cloudlog._concepts = {'foo#foo': {alias: 'foo', args: ['X', 'Y']},
				      'foo#bar': {alias: 'bar', args: ['X', 'Y', 'Z']}};
		$templateCache.put('foo', 'foo template');
		$templateCache.put('bar', '<span>{{X}} + {{Y}} = {{Z}}</span>');
		var scope = $rootScope.$new();
		scope.term = { name: 'foo#bar', args: [1, 2, 3] };
		var html = '<div clg-render-term="term">';
		var dom = $compile(html)(scope);
		scope.$digest();
		var span = dom.find('span');
		expect(span.length).toBe(1);
		expect(span.text()).toBe('1 + 2 = 3');
	    });
	});
	it('should render an underlying term if there is no template for this term and the other term is identified as Main', function(){
	    inject(function($compile, $rootScope, cloudlog, $templateCache) {
		cloudlog._concepts = {'foo#foo': {alias: 'foo', args: ['X', 'Main']},
				      'foo#bar': {alias: 'bar', args: ['X', 'Y', 'Z']}};
		$templateCache.put('bar', '<span>{{X}} + {{Y}} = {{Z}}</span>');
		var scope = $rootScope.$new();
		scope.term = { name: 'foo#foo',
			       args: ['Not this', { name: 'foo#bar', args: [1, 2, 3] }]};
		var html = '<div clg-render-term="term">';
		var dom = $compile(html)(scope);
		scope.$digest();
		var span = dom.find('span');
		expect(span.length).toBe(1);
		expect(span.text()).toBe('1 + 2 = 3');
	    });
	});

    });
});
