'use strict';

angular.module('cloudlog-directive', [])

    .directive('clgNamespace', ['cloudlog', function(cloudlog) {
	function link(scope, element, attrs) {
	    cloudlog.defineNamspace(attrs.name, attrs.alias);
	};
	return {
	    restrict: 'E',
	    link: link,
	};
    }])

    .directive('clgDefine', ['cloudlog', function(cloudlog) {
	function link(scope, element, attrs) {
	    cloudlog.defineConcept(attrs.concept, attrs.alias);
	};
	return {
	    restrict: 'E',
	    link: link,
	};
    }])

    .directive('clgIndexed', ['cloudlog', function(cloudlog) {
	function link(scope, element, attrs) {
	    cloudlog.getIndexed(attrs.key, {}, scope, attrs.to);
	}
	return {
	    restrict: 'E',
	    link: link,
	};
    }]);
