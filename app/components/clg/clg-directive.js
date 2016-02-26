'use strict';
var templateCache = Object.create(null);

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
    .directive('clgQuery', ['cloudlog', '$parse', function(cloudlog, $parse) {
	function link(scope, element, attrs) {
	    var params = {};
	    if(attrs.assign) {
		params = $parse('{' + attrs.assign + '}')(scope);
	    }
	    cloudlog.query(attrs.goal, params, scope, attrs.to);
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
	    templateCache[attrs.id] = element.html();
	}
	return {
	    restrict: 'A',
	    link: link,
	};
    }])
    .directive('clgRenderTerm', ['cloudlog', '$templateCache', '$parse', '$compile', function(cloudlog, $templateCache, $parse, $compile) {
	function renderTerm(term, scope, element, attrs) {
	    if(!term) return;
	    if(!term.name) {
		console.error('Object ' + JSON.stringify(term) + ' is not a term');
		return;
	    }
	    var concept = cloudlog._concepts[term.name];
	    if(!concept) {
		console.error('Concept ' + term.name + ' is not defined');
		return;
	    }
	    var template = $templateCache.get(concept.alias) || templateCache[concept.alias];
	    if(!template) {
		var mainIdx = concept.args.indexOf('Main');
		if(mainIdx >= 0) {
		    return renderTerm(term.args[mainIdx], scope, element, attrs);
		} else {
		    console.error('Concept ' + term.name + ' does not have a template');
		    return;
		}
	    }
	    var newScope = scope.$new();
	    concept.args.forEach(function(arg, i) {
		newScope[arg] = term.args[i];
	    });
	    var newContent = $compile(template)(newScope);
	    element.html('<span></span>');
	    element.find('span').replaceWith(newContent);
	}
	function link(scope, element, attrs) {
	    renderTerm($parse(attrs.clgRenderTerm)(scope), scope, element, attrs);
	}
	return {
	    restrict: 'A',
	    link: link,
	};
    }]);
