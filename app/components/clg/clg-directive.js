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

    .directive('clgIndexed', ['cloudlog', '$parse', function(cloudlog, $parse) {
	function link(scope, element, attrs) {
	    var params = {};
	    if(attrs.assign) {
		params = $parse('{' + attrs.assign + '}')(scope);
	    }
	    cloudlog.getIndexed(attrs.key, params, scope, attrs.to);
	}
	return {
	    restrict: 'E',
	    link: link,
	};
    }])
    .directive('clgFact', ['cloudlog', '$parse', function(cloudlog, $parse) {
	function link(scope, element, attrs) {
	    scope['add_' + attrs.name] = function() {
		var params = {};
		if(attrs.assign) {
		    params = $parse('{' + attrs.assign + '}')(scope);
		}
		cloudlog.addAxioms(attrs.pattern, [params]);
	    };
	}
	return {
	    restrict: 'E',
	    link: link,
	};
    }]);
