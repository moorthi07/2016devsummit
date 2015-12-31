/*jslint browser: true, devel: true, node: true, debug: true, todo: true, indent: 2, maxlen: 150, unparam: true*/
/*global require, describe, it, beforeEach, afterEach, before, after, xdescribe, xit*/

var expect = require("chai").expect;
var sinon = require("sinon");
var restify = require('restify');

describe('att.rtc.dhs.e911', function () {
  'use strict';

  var e911,
    config;

  before(function () {
    e911 = require("../js/att.dhs.e911.js").e911;
    config = require('../js/att.dhs.config.js').config;
  });

  describe('Methods', function () {

    describe('createE911Id', function () {

      var restClientStub,
        restClientPostSpy,
        createJsonClientStub;

      beforeEach(function () {
        restClientStub = {
          post: function () {}
        };
        createJsonClientStub = sinon.stub(restify, 'createJsonClient', function () {
          return restClientStub;
        });
      });

      afterEach(function () {
        createJsonClientStub.restore();
      });

      it('Should exist', function () {
        expect(e911.createE911Id).to.be.a('function');
      });

      it('should get the app configuration', function () {
        var getAppConfigurationStub = sinon.stub(config, 'getAppConfiguration', function () {
          return {
            app_key: 'appkey',
            app_secret: 'appsecret',
            info: {
              dhs_name: 'dhs_name'
            }
          };
        });

        e911.createE911Id({
          token: 'token',
          address: {
            first_name: 'first_name',
            last_name: 'last_name',
            house_number: '1111',
            street: 'ABC street',
            city: 'Redmond',
            state: 'WA',
            zip: '90000'
          },
          is_confirmed: false,
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

        expect(e911.createE911Id).to.throw('DHS not configured. ' +
          'Please invoke ATT.dhs.configure with your app_key and app_secret');

        getAppConfigurationStub.restore();
      });

      describe('app_key and app_secret set', function () {

        var appConfig,
          getAppConfigurationStub,
          address,
          options;

        before(function () {
          address = {
            first_name: 'first_name',
            last_name: 'last_name',
            house_number: '1111',
            house_number_ext: 'A',
            street_dir: 'W',
            street_dir_suffix: 'Bound',
            street: 'ABC street',
            street_suffix: 'NE',
            unit: '100',
            city: 'Redmond',
            state: 'WA',
            zip: '90000',
            address_additional: 'Next to Walmart',
            comments: 'I own this place'
          };

          options = {
            token: 'token',
            address: address,
            is_confirmed: false,
            success: function () {},
            error: function () {}
          };

        });

        beforeEach(function () {
          appConfig = {
            app_key: 'appkey',
            app_secret: 'appsecret',
            api_endpoint: 'api_endpoint',
            e911_uri: 'e911_uri',
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
          expect(e911.createE911Id.bind(null)).to.throw('No options provided');
          expect(e911.createE911Id.bind(null, {})).to.throw('No options provided');
          expect(e911.createE911Id.bind(null, {
            option: 'INVALID'
          })).to.throw('No access token provided');
          expect(e911.createE911Id.bind(null, {
            token: 'token'
          })).to.throw('No address provided');
          expect(e911.createE911Id.bind(null, {
            token: 'token',
            address: 'INVALID'
          })).to.throw('Invalid address provided');
          expect(e911.createE911Id.bind(null, {
            token: 'token',
            address: {
              address: 'invalid'
            }
          })).to.throw('No first name provided');
          expect(e911.createE911Id.bind(null, {
            token: 'token',
            address: {
              first_name: 'first_name'
            }
          })).to.throw('No last name provided');
          expect(e911.createE911Id.bind(null, {
            token: 'token',
            address: {
              first_name: 'first_name',
              last_name: 'last_name'
            }
          })).to.throw('No house number provided');
          expect(e911.createE911Id.bind(null, {
            token: 'token',
            address: {
              first_name: 'first_name',
              last_name: 'last_name',
              house_number: '1111'
            }
          })).to.throw('No street provided');
          expect(e911.createE911Id.bind(null, {
            token: 'token',
            address: {
              first_name: 'first_name',
              last_name: 'last_name',
              house_number: '1111',
              street: 'ABC street'
            }
          })).to.throw('No city provided');
          expect(e911.createE911Id.bind(null, {
            token: 'token',
            address: {
              first_name: 'first_name',
              last_name: 'last_name',
              house_number: '1111',
              street: 'ABC street',
              city: 'Redmond'
            }
          })).to.throw('No state provided');
          expect(e911.createE911Id.bind(null, {
            token: 'token',
            address: {
              first_name: 'first_name',
              last_name: 'last_name',
              house_number: '1111',
              street: 'ABC street',
              city: 'Redmond',
              state: 'WA'
            }
          })).to.throw('No zip code provided');
          expect(e911.createE911Id.bind(null, {
            token: 'token',
            address: {
              first_name: 'first_name',
              last_name: 'last_name',
              house_number: '1111',
              street: 'ABC street',
              city: 'Redmond',
              state: 'WA',
              zip: '90000'
            },
            is_confirmed: false
          })).to.throw('No success callback provided');
          expect(e911.createE911Id.bind(null, {
            token: 'token',
            address: {
              first_name: 'first_name',
              last_name: 'last_name',
              house_number: '1111',
              street: 'ABC street',
              city: 'Redmond',
              state: 'WA',
              zip: '90000'
            },
            is_confirmed: false,
            success: function () {}
          })).to.throw('No error callback provided');
          expect(e911.createE911Id.bind(null, {
            token: 'token',
            address: {
              first_name: 'first_name',
              last_name: 'last_name',
              house_number: '1111',
              street: 'ABC street',
              city: 'Redmond',
              state: 'WA',
              zip: '90000'
            },
            is_confirmed: false,
            success: function () {},
            error: function () {}
          })).to.not.throw();
        });

        it('should execute `restify.createJsonClient` with correct params', function () {
          e911.createE911Id({
            token: 'token',
            address: {
              first_name: 'first_name',
              last_name: 'last_name',
              house_number: '1111',
              street: 'ABC street',
              city: 'Redmond',
              state: 'WA',
              zip: '90000'
            },
            is_confirmed: false,
            success: function () {},
            error: function () {}
          });

          expect(createJsonClientStub.called).to.equal(true);
          expect(createJsonClientStub.getCall(0).args[0]).to.be.an('object');
          expect(createJsonClientStub.getCall(0).args[0].url).to.equal(appConfig.api_endpoint);
          expect(createJsonClientStub.getCall(0).args[0].userAgent).to.equal(appConfig.info.dhs_name);
          expect(createJsonClientStub.getCall(0).args[0].accept).to.equal('application/json');
          expect(createJsonClientStub.getCall(0).args[0].headers).to.be.an('object');
          expect(createJsonClientStub.getCall(0).args[0].headers.Authorization).to.equal('bearer token');
          expect(createJsonClientStub.getCall(0).args[0].rejectUnauthorized).to.equal(false);
        });

        it('should invoke `post` with correct params', function () {
          restClientPostSpy = sinon.spy(restClientStub, 'post');

          e911.createE911Id(options);

          expect(restClientPostSpy.called).to.equal(true);
          expect(restClientPostSpy.getCall(0).args[0]).to.equal(appConfig.info.e911id_uri);
          expect(restClientPostSpy.getCall(0).args[1]).to.be.an('object');
          expect(restClientPostSpy.getCall(0).args[1].e911Context).to.be.an('object');
          expect(restClientPostSpy.getCall(0).args[1].e911Context.address).to.be.an('object');
          expect(restClientPostSpy.getCall(0).args[1].e911Context.address.name).to.equal(address.first_name + ' ' + address.last_name);
          expect(restClientPostSpy.getCall(0).args[1].e911Context.address.houseNumber).to.equal(address.house_number);
          expect(restClientPostSpy.getCall(0).args[1].e911Context.address.houseNumExt).to.equal(address.house_number_ext);
          expect(restClientPostSpy.getCall(0).args[1].e911Context.address.streetDir).to.equal(address.street_dir);
          expect(restClientPostSpy.getCall(0).args[1].e911Context.address.streetDirSuffix).to.equal(address.street_dir_suffix);
          expect(restClientPostSpy.getCall(0).args[1].e911Context.address.street).to.equal(address.street);
          expect(restClientPostSpy.getCall(0).args[1].e911Context.address.streetNameSuffix).to.equal(address.street_suffix);
          expect(restClientPostSpy.getCall(0).args[1].e911Context.address.unit).to.equal(address.unit);
          expect(restClientPostSpy.getCall(0).args[1].e911Context.address.city).to.equal(address.city);
          expect(restClientPostSpy.getCall(0).args[1].e911Context.address.state).to.equal(address.state);
          expect(restClientPostSpy.getCall(0).args[1].e911Context.address.zip).to.equal(address.zip);
          expect(restClientPostSpy.getCall(0).args[1].e911Context.address.addressAdditional).to.equal(address.address_additional);
          expect(restClientPostSpy.getCall(0).args[1].e911Context.address.comments).to.equal(address.comments);
          expect(restClientPostSpy.getCall(0).args[1].e911Context.isAddressConfirmed).to.equal(false);
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
            options.error = errorSpy;

            restClientPostStub = sinon.stub(restClientStub, 'post', function (url, payload, callback) {
              callback(error, {}, {}, {});
            });
          });

          afterEach(function () {
            restClientPostStub.restore();
          });

          it('Should call the error callback if post returns with an error', function () {
            e911.createE911Id(options);

            expect(errorSpy.calledWith(error)).to.equal(true);
          });

        });

        describe('resclient /POST : callback with success', function () {

          var restClientPostStub,
            successSpy,
            result;

          beforeEach(function () {
            result = {
              result: 'result'
            };
            successSpy = sinon.spy();
            options.success = successSpy;

            restClientPostStub = sinon.stub(restClientStub, 'post', function (url, payload, callback) {
              callback(null, {}, {}, result);
            });
          });

          afterEach(function () {
            restClientPostStub.restore();
          });

          it('Should call the error callback if post returns with an error', function () {
            e911.createE911Id(options);

            expect(successSpy.calledWith(result)).to.equal(true);
          });

        });

      });

    });

  });

});