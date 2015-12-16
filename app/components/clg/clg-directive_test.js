'use strict';

describe('cloudlog.directive module', function() {
  beforeEach(module('cloudlog'));

  describe('app-version directive', function() {
    it('should print current version', function() {
      module(function($provide) {
        $provide.value('version', 'TEST_VER');
      });
      inject(function($compile, $rootScope) {
        var element = $compile('<span clg-version></span>')($rootScope);
        expect(element.text()).toEqual('TEST_VER');
      });
    });
  });
});
