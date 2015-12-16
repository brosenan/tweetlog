'use strict';

describe('cloudlog module', function() {
  beforeEach(module('cloudlog'));

  describe('version', function() {
    it('should return current version', inject(function(version) {
      expect(version).toEqual('0.1');
    }));
  });
});
