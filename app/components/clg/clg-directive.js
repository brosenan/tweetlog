'use strict';

angular.module('cloudlog-directive', [])

.directive('clgVersion', ['version', function(version) {
  return function(scope, elm, attrs) {
    elm.text(version);
  };
}]);
