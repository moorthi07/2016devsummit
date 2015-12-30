/*jslint browser: true, devel: true, node: true, debug: true, todo: true, indent: 2, maxlen: 150, unparam: true*/
/*global require, describe, it, beforeEach, afterEach, before, after, xdescribe, xit*/

var expect = require("chai").expect;
var sinon = require("sinon");
var restify = require('restify');

describe('att.rtc.dhs.oauth', function () {
  'use strict';

  var oauth,
    config;

  before(function () {
    oauth = require('../js/att.dhs.oauth.js').oauth;
    config = require('../js/att.dhs.config.js').config;
  });

  describe('Methods', function () {

    describe('getAuthorizeUrl', function () {

      it('should exist', function () {
        expect(oauth.getAuthorizeUrl).to.be.a('function');
      });

      it('should get the app configuration', function () {
        var getAppConfigurationStub = sinon.stub(config, 'getAppConfiguration', function () {
          return {
            app_key: 'appkey',
            app_secret: 'appsecret'
          };
        });

        oauth.getAuthorizeUrl();

        expect(getAppConfigurationStub.called).to.equal(true);

        getAppConfigurationStub.restore();
      });

      it('should throw an error if configuration does not have app_key and app_secret', function () {
        var getAppConfigurationStub = sinon.stub(config, 'getAppConfiguration', function () {
          return {};
        });

        expect(oauth.getAuthorizeUrl).to.throw('DHS configuration error. app_key and app_secret are mandatory');

        getAppConfigurationStub.restore();
      });

      it('Should return the user consent url for mobile number users', function () {
        var appConfig = {
          app_key: 'appkey',
          app_secret: 'appsecret',
          api_endpoint: 'api_endpoint',
          authorize_uri: 'authorize_uri'
        },
          getAppConfigurationStub = sinon.stub(config, 'getAppConfiguration', function () {
            return appConfig;
          });

        expect(oauth.getAuthorizeUrl()).to.equal(appConfig.api_endpoint + appConfig.authorize_uri + '?' +
          'client_id=' + appConfig.app_key + '&scope=WEBRTCMOBILE');

        getAppConfigurationStub.restore();
      });
    });

    describe('createAccessToken', function () {

      var restClientStub,
        restClientPostSpy,
        createStringClientStub;

      beforeEach(function () {
        restClientStub = {
          post: function () {}
        };
        createStringClientStub = sinon.stub(restify, 'createStringClient', function () {
          return restClientStub;
        });
      });

      afterEach(function () {
        createStringClientStub.restore();
      });

      it('should exist', function () {
        expect(oauth.createAccessToken).to.be.a('function');
      });

      it('should get the app configuration', function () {
        var getAppConfigurationStub = sinon.stub(config, 'getAppConfiguration', function () {
          return {
            app_key: 'appkey',
            app_secret: 'appsecret',
            info: {
              dhs_name: 'dhs'
            }
          };
        });

        oauth.createAccessToken({
          app_scope: 'ACCOUNT_ID',
          success: function () {},
          error: function () {}
        });

        expect(getAppConfigurationStub.called).to.equal(true);

        getAppConfigurationStub.restore();
      });

      it('should throw an error if configuration does not have app_key and app_secret', function () {
        var getAppConfigurationStub = sinon.stub(config, 'getAppConfiguration', function () {
          return {};
        });

        expect(oauth.createAccessToken).to.throw('DHS configuration error. app_key and app_secret are mandatory');

        getAppConfigurationStub.restore();
      });

      describe('app_key and app_secret are configured', function () {

        var appConfig,
          getAppConfigurationStub;

        beforeEach(function () {
          appConfig = {
            app_key: 'appkey',
            app_secret: 'appsecret',
            api_endpoint: 'api_endpoint',
            authorize_uri: 'authorize_uri',
            info: {
              dhs_name: 'dhs_name'
            }
          };

          getAppConfigurationStub = sinon.stub(config, 'getAppConfiguration', function () {
            return appConfig;
          });
        });

        afterEach(function () {
          getAppConfigurationStub.restore();
        });

        it('Should throw error for invalid arguments', function () {
          expect(oauth.createAccessToken.bind(null)).to.throw('No app_scope provided');
          expect(oauth.createAccessToken.bind(null, {})).to.throw('No app_scope provided');
          expect(oauth.createAccessToken.bind(null, {
            app_scope: 'INVALID'
          })).to.throw('app_scope should be one of MOBILE_NUMBER, VIRTUAL_NUMBER, ACCOUNT_ID or E911');
          expect(oauth.createAccessToken.bind(null, {
            app_scope: 'MOBILE_NUMBER'
          })).to.throw('No auth_code provided');
          expect(oauth.createAccessToken.bind(null, {
            app_scope: 'MOBILE_NUMBER',
            auth_code: 'auth_code'
          })).to.throw('No success callback provided');
          expect(oauth.createAccessToken.bind(null, {
            app_scope: 'MOBILE_NUMBER',
            auth_code: 'auth_code',
            success: function () {}
          })).to.throw('No error callback provided');
          expect(oauth.createAccessToken.bind(null, {
            app_scope: 'MOBILE_NUMBER',
            auth_code: 'auth_code',
            success: function () {},
            error: function () {}
          })).to.not.throw();
          expect(oauth.createAccessToken.bind(null, {
            app_scope: 'VIRTUAL_NUMBER',
            success: function () {},
            error: function () {}
          })).to.not.throw();
          expect(oauth.createAccessToken.bind(null, {
            app_scope: 'ACCOUNT_ID',
            success: function () {},
            error: function () {}
          })).to.not.throw();
          expect(oauth.createAccessToken.bind(null, {
            app_scope: 'E911',
            success: function () {},
            error: function () {}
          })).to.not.throw();
        });

        it('should execute `restify.createStringClient` with correct params', function () {
          oauth.createAccessToken({
            app_scope: 'ACCOUNT_ID',
            success: function () {},
            error: function () {}
          });

          expect(createStringClientStub.called).to.equal(true);
          expect(createStringClientStub.getCall(0).args[0]).to.be.an('object');
          expect(createStringClientStub.getCall(0).args[0].url).to.equal(appConfig.api_endpoint);
          expect(createStringClientStub.getCall(0).args[0].userAgent).to.equal(appConfig.info.dhs_name);
          expect(createStringClientStub.getCall(0).args[0].accept).to.equal('application/json');
          expect(createStringClientStub.getCall(0).args[0].rejectUnauthorized).to.equal(false);
        });

        it('should invoke `post` with correct params for MOBILE_NUMBER', function () {
          restClientPostSpy = sinon.spy(restClientStub, 'post');

          oauth.createAccessToken({
            app_scope: 'MOBILE_NUMBER',
            auth_code: 'auth_code',
            success: function () {},
            error: function () {}
          });

          expect(restClientPostSpy.called).to.equal(true);
          expect(restClientPostSpy.getCall(0).args[0]).to.equal(appConfig.token_uri);
          expect(restClientPostSpy.getCall(0).args[1]).to.be.an('object');
          expect(restClientPostSpy.getCall(0).args[1].client_id).to.equal(appConfig.app_key);
          expect(restClientPostSpy.getCall(0).args[1].client_secret).to.equal(appConfig.app_secret);
          expect(restClientPostSpy.getCall(0).args[1].grant_type).to.equal('authorization_code');
          expect(restClientPostSpy.getCall(0).args[1].scope).to.equal('WEBRTCMOBILE');
          expect(restClientPostSpy.getCall(0).args[1].code).to.equal('auth_code');
          expect(restClientPostSpy.getCall(0).args[2]).to.be.a('function');

          restClientPostSpy.restore();
        });

        it('should invoke `post` with correct params for VIRTUAL_NUMBER', function () {
          restClientPostSpy = sinon.spy(restClientStub, 'post');

          oauth.createAccessToken({
            app_scope: 'VIRTUAL_NUMBER',
            success: function () {},
            error: function () {}
          });

          expect(restClientPostSpy.called).to.equal(true);
          expect(restClientPostSpy.getCall(0).args[0]).to.equal(appConfig.token_uri);
          expect(restClientPostSpy.getCall(0).args[1]).to.be.an('object');
          expect(restClientPostSpy.getCall(0).args[1].client_id).to.equal(appConfig.app_key);
          expect(restClientPostSpy.getCall(0).args[1].client_secret).to.equal(appConfig.app_secret);
          expect(restClientPostSpy.getCall(0).args[1].grant_type).to.equal('client_credentials');
          expect(restClientPostSpy.getCall(0).args[1].scope).to.equal('WEBRTC');
          expect(restClientPostSpy.getCall(0).args[2]).to.be.a('function');

          restClientPostSpy.restore();
        });

        it('should invoke `post` with correct params for ACCOUNT_ID', function () {
          restClientPostSpy = sinon.spy(restClientStub, 'post');

          oauth.createAccessToken({
            app_scope: 'ACCOUNT_ID',
            success: function () {},
            error: function () {}
          });

          expect(restClientPostSpy.called).to.equal(true);
          expect(restClientPostSpy.getCall(0).args[0]).to.equal(appConfig.token_uri);
          expect(restClientPostSpy.getCall(0).args[1]).to.be.an('object');
          expect(restClientPostSpy.getCall(0).args[1].client_id).to.equal(appConfig.app_key);
          expect(restClientPostSpy.getCall(0).args[1].client_secret).to.equal(appConfig.app_secret);
          expect(restClientPostSpy.getCall(0).args[1].grant_type).to.equal('client_credentials');
          expect(restClientPostSpy.getCall(0).args[1].scope).to.equal('WEBRTC');
          expect(restClientPostSpy.getCall(0).args[2]).to.be.a('function');

          restClientPostSpy.restore();
        });

        describe('resclient /POST : callback with error', function () {

          var restClientPostStub,
            errorSpy,
            error;

          beforeEach(function () {
            error = {
              error: 'error'
            };
            errorSpy = sinon.spy();
            restClientPostStub = sinon.stub(restClientStub, 'post', function (url, payload, callback) {
              callback(error, {}, {}, {});
            });
          });

          afterEach(function () {
            restClientPostStub.restore();
          });

          it('Should call the error callback if post returns with an error', function () {
            oauth.createAccessToken({
              app_scope: 'ACCOUNT_ID',
              success: function () {},
              error: errorSpy
            });

            expect(errorSpy.calledWith(error)).to.equal(true);
          });

        });

        describe('resclient /POST : callback with success', function () {

          var restClientPostStub,
            successSpy,
            result;

          beforeEach(function () {
            result = '{"result": "result"}';
            successSpy = sinon.spy();
            restClientPostStub = sinon.stub(restClientStub, 'post', function (url, payload, callback) {
              callback(null, {}, {}, result);
            });
          });

          afterEach(function () {
            restClientPostStub.restore();
          });

          it('Should call the success callback if post returns with a success', function () {
            oauth.createAccessToken({
              app_scope: 'ACCOUNT_ID',
              success: successSpy,
              error: function () {}
            });

            expect(successSpy.calledWith(JSON.parse(result))).to.equal(true);
          });

        });

      });

    });

  });


});