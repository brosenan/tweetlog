'use strict';

angular.module('cloudlog', [
//  'myApp.version.interpolate-filter',
  'cloudlog-directive'
])

    .value('version', '0.1')
    .factory('cloudlog', ['$http', '$log', function($http, $log) {
	var encoded = Object.create(null);
	function encode(pattern, cb, errCb) {
	    if(pattern in encoded) {
		cb(encoded[pattern]);
	    } else {
		$http({
		    method: 'POST',
		    url: '/encode/f',
		    data: pattern,
		    headers: {'content-type': 'text/cloudlog'},
		}).then(function(resp) {
		    encoded[pattern] = resp.data.url;
		    cb(resp.data.url);
		}, errCb);
	    }
	}
	return {
	    addAxioms: function(pattern, data, done, errCb) {
		encode(pattern, function(url) {
		    data.forEach(function(x) { x._count = 1; });
		    $http({
			method: 'POST',
			url: url,
			data: data,
		    }).then(function(resp) {if(done) done()}, errCb);
		}, errCb);
	    },
	};
    }]);
