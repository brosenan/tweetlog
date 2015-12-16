'use strict';

describe('tweetlog', function() {

    beforeEach(module('tweetlog'));

    it('should exist', function($controller, $log){
	var ctrl = $controller('TweetlogCtrl');
	expect(ctrl).toBeUndefined();
    });
});

