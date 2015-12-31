/*jslint browser: true, devel: true, node: true, debug: true, todo: true, indent: 2, maxlen: 150, unparam: true*/
/*global require, describe, it, beforeEach, afterEach, before, after, xdescribe, xit*/

var expect = require("chai").expect;

describe('att.rtc.dhs', function () {
  'use strict';

  var dhs;

  before(function () {
    dhs = require('../js/att.dhs.js');
  });

  it('Should expose namespace `ATT.dhs`', function () {
    expect(dhs).to.be.an('object');
  });

  describe('Methods', function () {

    it('Should expose method `ATT.dhs.configure`', function () {
      expect(dhs.configure).to.be.a('function');
    });


    it('should expose method `getConfiguration`', function () {
      expect(dhs.getConfiguration).to.be.a('function');
    });

    it('Should expose method `ATT.dhs.getAuthorizeUrl`', function () {
      expect(dhs.getAuthorizeUrl).to.be.a('function');
    });

    it('Should expose method `ATT.dhs.createAccessToken`', function () {
      expect(dhs.createAccessToken).to.be.a('function');
    });

    it('Should expose method `ATT.dhs.createE911Id`', function () {
      expect(dhs.createE911Id).to.be.a('function');
    });

  });

});