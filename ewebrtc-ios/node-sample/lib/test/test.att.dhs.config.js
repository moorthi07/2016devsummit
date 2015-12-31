/*jslint browser: true, devel: true, node: true, debug: true, todo: true, indent: 2, maxlen: 150, unparam: true*/
/*global require, describe, it, beforeEach, afterEach, before, after, xdescribe, xit*/

var expect = require("chai").expect;

describe('att.rtc.dhs.config', function () {
  'use strict';

  var config,
    pkg;

  before(function () {
    config = require('../js/att.dhs.config.js').config;
    pkg = require('../package.json');
  });

  it('Should initialize the default configuration from the package.json', function () {
    expect(config.getConfiguration()).to.eql(pkg.config);
  });

  describe('Methods', function () {

    describe('getConfiguration', function () {

      it('should exist', function () {
        expect(config.getConfiguration).to.be.a('function');
      });

      it('Should return the environment configuration', function () {
        expect(config.getConfiguration()).to.eql(pkg.config);
      });
    });

    describe('configure', function () {

      it('Should expose method `ATT.dhs.configure`', function () {
        expect(config.configure).to.be.a('function');
      });

      it('Should throw error if invalid options passed in', function () {
        expect(config.configure.bind(null)).to.throw('No options provided');
        expect(config.configure.bind(null, {})).to.throw('No options provided');
        expect(config.configure.bind(null, {
          option: 'INVALID'
        })).to.throw('No app_key provided');
        expect(config.configure.bind(null, {
          app_key: 'app_key'
        })).to.throw('No app_secret provided');
        expect(config.configure.bind(null, {
          app_key: 'app_key',
          app_secret: 'app_secret'
        })).to.not.throw();
      });

      it('Should update the default configuration with the provided configuration', function () {
        var newConfig = {
          app_key: 'app_key',
          app_secret: 'app_secret',
          virtual_numbers_pool: []
        },
          key,
          result = {},
          default_config;

        default_config = config.getConfiguration();

        config.configure(newConfig);

        for (key in default_config) {
          if (default_config.hasOwnProperty(key)) {
            result[key] = default_config[key];
          }
        }

        result.app_key = newConfig.app_key;
        result.virtual_numbers_pool = newConfig.virtual_numbers_pool;

        expect(config.getConfiguration()).to.eql(result);

      });


      it('Should create info section with the default configuration', function () {
        var newConfig = {
            app_key: 'app_key',
            app_secret: 'app_secret',
            virtual_numbers_pool: [],
            api_env: 'api_env',
            token_uri: 'token_uri',
            ewebrtc_uri: 'ewebrtc_uri',
            e911id_uri: 'e911id_uri'
          },
          result;

        config.configure(newConfig);

        result = config.getConfiguration();

        expect(result.info).to.be.an('object');
        expect(result.info.api_env).to.equal(newConfig.api_env);
        expect(result.info.token_uri).to.equal(newConfig.token_uri);
        expect(result.info.ewebrtc_uri).to.equal(newConfig.ewebrtc_uri);
        expect(result.info.scope_map).to.be.an('object');
        expect(result.info.e911id_uri).to.equal(newConfig.e911id_uri);
      });

    });

    describe('getAppConfiguration', function () {

      it('Should exist', function () {
        expect(config.getAppConfiguration).to.be.a('function');
      });

      it('should return the default configuration', function () {
        var defaultConfig = config.getAppConfiguration();

        expect(defaultConfig).to.eql(pkg.config);
      });
    });

    describe('getGrantType', function () {

      it('Should exist', function () {
        expect(config.getGrantType).to.be.a('function');
      });

      it('Should return the valid grant type for a given app scope', function () {
        expect(config.getGrantType('MOBILE_NUMBER')).to.equal('authorization_code');
        expect(config.getGrantType('VIRTUAL_NUMBER')).to.equal('client_credentials');
        expect(config.getGrantType('ACCOUNT_ID')).to.equal('client_credentials');
        expect(config.getGrantType('E911')).to.equal('client_credentials');
        expect(config.getGrantType('REFRESH')).to.equal('refresh_token');
      });
    });

    describe('getScope', function () {

      it('Should exist', function () {
        expect(config.getScope).to.be.a('function');
      });

      it('Should return the valid grant type for a given app scope', function () {
        expect(config.getScope('MOBILE_NUMBER')).to.equal(pkg.config.info.scope_map.MOBILE_NUMBER);
        expect(config.getScope('VIRTUAL_NUMBER')).to.equal(pkg.config.info.scope_map.VIRTUAL_NUMBER);
        expect(config.getScope('ACCOUNT_ID')).to.equal(pkg.config.info.scope_map.ACCOUNT_ID);
        expect(config.getScope('E911')).to.equal(pkg.config.info.scope_map.E911);
      });
    });

  });

});