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
    }])
    .directive('clgConcept', ['cloudlog', function(cloudlog) {
	function link(scope, element, attrs) {
	    cloudlog.defineConcept(attrs.clgConcept, attrs.id);
	}
	return {
	    restrict: 'A',
	    link: link,
	};
    }])
    .directive('clgApplyTemplate', ['cloudlog', '$templateCache', '$parse', '$compile', function(cloudlog, $templateCache, $parse, $compile) {
	function link(scope, element, attrs) {
	    var term = $parse(attrs.model)(scope);
	    var concept = cloudlog._concepts[term.name];
	    // TODO: If concept is undefined
	    var template = $templateCache.get(concept.alias);
	    var newScope = scope.$new();
	    concept.args.forEach(function(arg, i) {
		newScope[arg] = term.args[i];
	    });
	    element.replaceWith($compile(template)(newScope));
	}
	return {
	    restrict: 'E',
	    link: link,
	};
    }]);
