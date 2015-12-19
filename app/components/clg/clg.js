'use strict';

angular.module('cloudlog', [
    'cloudlog-directive',
    'ngRoute',
])
    .factory('cloudlog', ['$http', '$parse', function($http, $parse) {
	var encoded = Object.create(null);
	var namespaces = Object.create(null);
	var concepts = Object.create(null);
	var contepRE = /([a-zA-Z_]+):([a-zA-Z_]+)\((.*)\)/;
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
	function calcParams(params, result) {
	    var result = result || Object.create(null);
	    Object.keys(params).forEach(function(key) {
		if(typeof params[key] === 'string') {
		    result['str-' + key] = params[key];
		} else if(typeof params[key] === 'number') {
		    result['num-' + key] = params[key];
		}
	    });
	    return result;
	}
	function addConceptValues(data) {
	    data.forEach(function(elem) {
		if(elem.Fact.name in concepts) {
		    var concept = concepts[elem.Fact.name];
		    for(var i = 0; i < concept.args.length; i++) {
			elem[concept.args[i]] = elem.Fact.args[i];
		    }
		    elem.alias = concept.alias;
		}
	    });
	    return data;
	}
	return {
	    addAxioms: function(pattern, data, done, errCb) {
		encode(pattern, '/f', function(url) {
		    data.forEach(function(x) { x._count = 1; });
		    $http({
			method: 'POST',
			url: url,
			data: data,
			params: namespaces,
		    }).then(done, errCb);
		}, errCb);
	    },
	    getIndexed: function(pattern, params, scope, expr, errCb) {
		var setter = $parse(expr).assign;
		encode(pattern, '/idx', function(url) {
		    $http({
			mehtod: 'GET',
			url: url,
			params: calcParams(params, namespaces),
		    }).then(function(resp) {
			setter(scope, addConceptValues(resp.data));
		    }, errCb);
		});
	    },
	    defineNamspace: function(name, alias) {
		namespaces['import-' + alias] = name;
		Object.keys(concepts).forEach(function(concept) {
		    var split = concept.split('#');
		    if(split[0] === alias) {
			var value = concepts[concept];
			delete concepts[concept];
			concepts[name + '#' + split[1]] = value;
		    }
		});
	    },
	    defineConcept: function(concept, alias) {
		var m = concept.match(contepRE);
		var args = m[3]
		    .split(',')
		    .map(function(s) { return s.trim(); });
		var ns = namespaces['import-' + m[1]] || m[1];
		concepts[ns + '#' + m[2]] = {alias: alias,
					       args: args};
	    },
	    _concepts: concepts,
	};
    }])
    .controller('CloudlogCtrl', ['$scope', '$routeParams', function($scope, $routeParams) {
	$scope.$routeParams = $routeParams;
    }]);
