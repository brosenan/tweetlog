'use strict';

angular.module('cloudlog-directive', [])

    .directive('clgNamespace', ['cloudlog', function(cloudlog) {
	function link(scope, element, attrs) {
	    cloudlog.defineNamspace(attrs.name, attrs.alias);
	};
	return {
	    link: link,
	};
    }]);
