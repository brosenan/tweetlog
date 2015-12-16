'use strict';

angular.module('cloudlog', [
//  'myApp.version.interpolate-filter',
  'cloudlog-directive'
])

    .value('version', '0.1')
    .factory('cloudlog', ['$http', '$log', function($http, $log) {
	return {
	    addAxioms: function(pattern, data) {
		function handleError(resp) {
		}
		$http({
		    method: 'POST',
		    url: '/encode/f',
		    data: pattern,
		    headers: {'content-type': 'text/cloudlog'},
		}).then(function(resp) {
		    var url = resp.data.url;
		    $http({
			method: 'POST',
			url: url,
			data: data,
		    }).then(function(resp) {}, handleError);
		}, handleError);
	    },
	};
    }]);
