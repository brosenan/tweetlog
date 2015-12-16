'use strict';

describe('cloudlog module', function() {
    beforeEach(module('cloudlog'));
    var $httpBackend;
    var cloudlog;
    beforeEach(inject(function($injector) {
	$httpBackend = $injector.get('$httpBackend');
//	encodeF = $httpBackend.when('POST', '/encode/f')
//            .respond({userId: 'userX'}, {'A-Token': 'xxx'});
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
});
