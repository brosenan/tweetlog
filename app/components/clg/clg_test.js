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

    describe('.addAxioms(pattern, data)', function(){
	it('should encode the pattern and then use the given URL', function(){
	    var pattern = "foo(A, B)";
	    var data = [{A: 1, B: 2}];
	    $httpBackend.expectPOST('/encode/f', pattern).respond(200, '{"url":"http://myserver/abcdefg123"}');
	    $httpBackend.expectPOST('http://myserver/abcdefg123', data).respond(200, '{"status":"OK"}');
	    cloudlog.addAxioms(pattern, data);
	    $httpBackend.flush();
	});

    });

});
