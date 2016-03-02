'use strict';

describe('cloudlog module', function() {
    beforeEach(module('cloudlog'));
    var $httpBackend;
    var cloudlog;
    beforeEach(inject(function($injector) {
	$httpBackend = $injector.get('$httpBackend');
	cloudlog = $injector.get('cloudlog');
    }));

    afterEach(function() {
	$httpBackend.verifyNoOutstandingExpectation();
	$httpBackend.verifyNoOutstandingRequest();
    });

    describe('.addAxioms(pattern, data, done, errCb)', function(){
	it('should encode the pattern and then use the given URL', function(){
	    var pattern = "foo(A, B)";
	    var data = [{A: 1, B: 2}];
	    $httpBackend.expectPOST('/encode/f', pattern).respond(200, '{"url":"http://myserver/abcdefg123"}');
	    $httpBackend.expectPOST('http://myserver/abcdefg123', [{A: 1, B: 2, _count:1}]).respond(200, '{"status":"OK"}');
	    cloudlog.addAxioms(pattern, data);
	    $httpBackend.flush();
	});
	it('should not encode a pattern already encoded', function(){
	    var pattern = "foo(A, B)";
	    var data1 = [{A: 1, B: 2}];
	    $httpBackend.expectPOST('/encode/f', pattern).respond(200, '{"url":"http://myserver/abcdefg123"}');
	    $httpBackend.expectPOST('http://myserver/abcdefg123', [{A: 1, B: 2, _count:1}]).respond(200, '{"status":"OK"}');
	    cloudlog.addAxioms(pattern, data1);
	    $httpBackend.flush();
	    
	    var data2 = [{A: 2, B: 4}];
	    $httpBackend.expectPOST('http://myserver/abcdefg123', [{A: 2, B: 4, _count:1}]).respond(200, '{"status":"OK"}');
	    cloudlog.addAxioms(pattern, data2);
	    $httpBackend.flush();
	});
	it('should call done() when done', function(){
	    var pattern = "foo(A, B)";
	    var data = [{A: 1, B: 2}];
	    var done = false;
	    $httpBackend.expectPOST('/encode/f', pattern).respond(200, '{"url":"http://myserver/abcdefg123"}');
	    $httpBackend.expectPOST('http://myserver/abcdefg123', [{A: 1, B: 2, _count:1}]).respond(200, '{"status":"OK"}');
	    cloudlog.addAxioms(pattern, data, function() { done = true; });
	    expect(done).toBe(false);
	    $httpBackend.flush();
	    expect(done).toBe(true);
	});
    });
    describe('.getIndexed(pattern, params, scope, expr, errCb)', function(){
	it('should perform an indexed query', function(){
	    var pattern = "bar(X)";
	    var params = {X: "foo", Y: 2};
	    var scope = {};
	    var expr = "results";
	    var resp = [{Fact: {name: "foo", args: []}, _count: 1},
			{Fact: {name: "bar", args: []}, _count: 1}];
	    $httpBackend.expectPOST('/encode/idx', pattern).respond(200, '{"url":"http://myserver/idx/idxencoded"}');
	    $httpBackend.expectGET("http://myserver/idx/idxencoded?num-Y=2&str-X=foo").respond(200, resp);
	    cloudlog.getIndexed(pattern, params, scope, expr);
	    expect(scope.results).toEqual([]);
	    var resultsInstance = scope.results;
	    $httpBackend.flush();
	    expect(scope.results).toEqual(resp);
	    expect(scope.results).toBe(resultsInstance);
	});
    });
    describe('.query(pattern, params, scope, expr, errCb)', function(){
	it('should perform a query', function(){
	    var pattern = "bar(X, Y)";
	    var params = {X: "foo", Z: 2};
	    var scope = {};
	    var expr = "results";
	    var resp = [{Y: 1, _count: 1},
			{Y: 2, _count: 1}];
	    $httpBackend.expectPOST('/encode/q', pattern).respond(200, '{"url":"http://myserver/q/querycoded"}');
	    $httpBackend.expectGET("http://myserver/q/querycoded?num-Z=2&str-X=foo").respond(200, resp);
	    cloudlog.query(pattern, params, scope, expr);
	    expect(scope.results).toEqual([]);
	    var resultsInstance = scope.results;
	    $httpBackend.flush();
	    expect(scope.results).toEqual(resp);
	    expect(scope.results).toBe(resultsInstance);
	});

    });

    describe('.defineNamspace(name, alias)', function(){
	it('should append import-* query params to /f queries', function(){
	    cloudlog.defineNamspace('/foo', 'foo');
	    $httpBackend.expectPOST('/encode/f', 'somePattern').respond(200, '{"url":"http://myserver/abcdefg123"}');
	    $httpBackend.expectPOST('http://myserver/abcdefg123?import-foo=' + encodeURIComponent('/foo'), []).respond(200, '{"status":"OK"}');
	    cloudlog.addAxioms('somePattern', []);
	    $httpBackend.flush();
	});

	it('should append import-* query params to /idx queries', function(){
	    cloudlog.defineNamspace('/foo', 'foo');
	    $httpBackend.expectPOST('/encode/idx', 'somePattern').respond(200, '{"url":"http://myserver/abcdefg123"}');
	    $httpBackend.expectGET('http://myserver/abcdefg123?import-foo=' + encodeURIComponent('/foo') + "&num-Bar=1&str-Baz=z").respond(200, '[]');
	    cloudlog.getIndexed('somePattern', {Bar: 1, Baz: 'z'}, {}, 'someField');
	    $httpBackend.flush();
	});
	it('should apply namespace to existing concepts if defined after them', function(){
	    cloudlog.defineConcept("ns:foo(A, B, C)", "foo");
	    cloudlog.defineNamspace('/ns', 'ns');
	    expect(cloudlog._concepts['/ns#foo']).toBeDefined();
	});

    });
    describe('.defineConcept(concept, alias)', function(){
	it('should add a concept to the concept registry', function(){
	    cloudlog.defineConcept("ns:foo(A, B, C)", "foo");
	    expect(cloudlog._concepts['ns#foo']).toBeDefined();
	    expect(cloudlog._concepts['ns#foo'].alias).toBe("foo");
	    expect(cloudlog._concepts['ns#foo'].args).toEqual(['A', 'B', 'C']);
	});
	it('should respect defined namespaces', function(){
	    cloudlog.defineNamspace("/myNamespace", "ns");
	    cloudlog.defineConcept("ns:foo(A, B, C)", "foo");
	    expect(cloudlog._concepts['/myNamespace#foo']).toBeDefined();
	});
	it('should support concepts without namespace', function(){
	    cloudlog.defineConcept("!@(A, B, C)", "foo");
	    expect(cloudlog._concepts['!@']).toBeDefined();
	});

	it('should decorate matching index results with the variables in the concept bound to their respective values', function(){
	    var results = [
		{Fact: {name: 'ns#foo', args: [1, 2]}, _count: 1},
		{Fact: {name: 'ns#bar', args: ['a', 'b', 'c']}, _count: 1},
	    ];
	    var scope = {};
	    $httpBackend.expectPOST('/encode/idx', 'somePattern').respond(200, '{"url":"http://myserver/abcdefg123"}');
	    $httpBackend.expectGET('http://myserver/abcdefg123').respond(200, JSON.stringify(results));
	    cloudlog.defineConcept('ns:foo(A, B)', 'foo');
	    cloudlog.defineConcept('ns:bar(X, Y, Z)', 'bar');
	    cloudlog.getIndexed('somePattern', {}, scope, 'results');
	    $httpBackend.flush();

	    expect(scope.results[0].A).toBe(1);
	    expect(scope.results[0].alias).toBe('foo');
	    expect(scope.results[1].A).toBeUndefined();
	    expect(scope.results[1].Z).toBe('c');
	    expect(scope.results[1].alias).toBe('bar');
	});

    });

});

describe('CloudlogCtrl', function(){
    var $controller, $provide;
    beforeEach(module('cloudlog'));
    it('should place all route parameters in the scope (decoded)', function(){
	var scope = {};
	module(function($provide) {
	    $provide.value('$routeParams', {foo: 'y%20t', bar: 'x'});
	});
	inject(function($controller) {
	    var ctrl = $controller('CloudlogCtrl', {$scope: scope});
	    expect(scope.foo).toBeDefined();
	    expect(scope.foo).toBe('y t');
	    expect(scope.bar).toBeDefined();
	    expect(scope.bar).toBe('x');
	});
    });
    it('should place all search parameters under $session, in the scope (decoded)', function(){
	var scope = {};
	module(function($provide) {
	    $provide.value('$location', {search: function() {
		return {foo: 'y t', bar: 'x'}
	    }});
	});
	inject(function($controller) {
	    var ctrl = $controller('CloudlogCtrl', {$scope: scope});
	    expect(scope.$session.foo).toBeDefined();
	    expect(scope.$session.foo).toBe('y t');
	    expect(scope.$session.bar).toBeDefined();
	    expect(scope.$session.bar).toBe('x');
	});
    });
    describe('.url(location[, args])', function(){
	it('should build a hash-url with the given location', function(){
	    var scope = {};
	    inject(function($controller) {
		var ctrl = $controller('CloudlogCtrl', {$scope: scope});
		expect(scope.url).toBeDefined();
		expect(scope.url('foo')).toBe('#/foo/');
	    });
	});
	it('should append all args, encoded', function(){
	    var scope = {};
	    inject(function($controller) {
		var ctrl = $controller('CloudlogCtrl', {$scope: scope});
		expect(scope.url('foo', ['bar', 'b/z'])).toBe('#/foo/bar/b%2Fz');
	    });
	});
	it('should encode all $session parameters as search parameters', function(){
	    var scope = {};
	    inject(function($controller) {
		var ctrl = $controller('CloudlogCtrl', {$scope: scope});
		scope.$session = {baz: 'b a z'};
		expect(scope.url('foo', [])).toBe('#/foo/?baz=b+a+z');
	    });
	});
    });

    describe('.now()', function(){
	it('should return the current time in milliseconds', function(){
	    var scope = {};
	    inject(function($controller) {
		var ctrl = $controller('CloudlogCtrl', {$scope: scope});
		expect(scope.now).toBeDefined();
		var time = scope.now();
		expect(time).toBeDefined();
		expect(Math.abs(time - (new Date()).getTime())).toBeLessThan(2);
	    });
	});

    });
});
