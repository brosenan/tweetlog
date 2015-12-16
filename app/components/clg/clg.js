'use strict';

angular.module('cloudlog', [
//  'myApp.version.interpolate-filter',
  'cloudlog-directive'
])

    .value('version', '0.1')
    .factory('cloudlog', ['$http', '$parse', function($http, $parse) {
	var encoded = Object.create(null);
	function encode(pattern, path, cb, errCb) {
	    if(pattern in encoded) {
		cb(encoded[pattern]);
	    } else {
		$http({
		    method: 'POST',
		    url: '/encode' + path,
		    data: pattern,
		    headers: {'content-type': 'text/cloudlog'},
		}).then(function(resp) {
		    encoded[pattern] = resp.data.url;
		    cb(resp.data.url);
		}, errCb);
	    }
	}
	function calcParams(params) {
	    var result = Object.create(null);
	    Object.keys(params).forEach(function(key) {
		result['str-' + key] = params[key];
	    });
	    return result;
	}
	return {
	    addAxioms: function(pattern, data, done, errCb) {
		encode(pattern, '/f', function(url) {
		    data.forEach(function(x) { x._count = 1; });
		    $http({
			method: 'POST',
			url: url,
			data: data,
		    }).then(function(resp) {if(done) done()}, errCb);
		}, errCb);
	    },
	    getIndexed: function(pattern, params, scope, expr, errCb) {
		var setter = $parse(expr).assign;
		encode(pattern, '/idx', function(url) {
		    $http({
			mehtod: 'GET',
			url: url,
			params: calcParams(params),
		    }).then(function(resp) {
			setter(scope, resp.data);
		    }, errCb);
		});
	    },
	};
    }]);
