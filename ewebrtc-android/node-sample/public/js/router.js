/*jslint browser: true, devel: true, node: true, debug: true, todo: true, indent: 2, maxlen: 150*/
/*global ajaxRequest, loadDefaultView
*/

'use strict';
var myDHS = 'http://192.168.1.38:9000',
  api_endpoint = 'https://api.att.com/RTC/v1/',
  associateUser_endpoint = 'userIds/',
  config,
  virtual_numbers,
  ewebrtc_domain;

function loadConfiguration(callback) {
  var xhrConfig = new XMLHttpRequest();
  xhrConfig.open('GET', myDHS + "/config/");
  xhrConfig.onreadystatechange = function () {
    if (xhrConfig.readyState === 4) {
      if (xhrConfig.status === 200) {
        config = JSON.parse(xhrConfig.responseText);
        console.log(config);
        virtual_numbers = config.virtual_numbers_pool;
        ewebrtc_domain = config.ewebrtc_domain;
        callback();
      } else {
        console.error(xhrConfig.responseText);
      }
    }
  };
  xhrConfig.send();
}

// ### Create Access Token
function createAccessToken(appScope, authCode, success, error) {
  var xhrToken = new XMLHttpRequest();

  xhrToken.open('POST', config.app_token_url);
  xhrToken.setRequestHeader("Content-Type", "application/json");
  xhrToken.onreadystatechange = function () {
    if (xhrToken.readyState === 4) {
      if (xhrToken.status === 200) {
        success(JSON.parse(xhrToken.responseText));
      } else {
        error(xhrToken.responseText);
      }
    }
  };
  xhrToken.send(JSON.stringify({app_scope: appScope, auth_code: authCode}));
}

// ### Create e911 id
function createE911Id(accessToken, address, is_confirmed, success, error) {
  var xhrE911 = new XMLHttpRequest();

  xhrE911.open('POST', config.app_e911id_url);
  xhrE911.setRequestHeader("Content-Type", "application/json");
  xhrE911.onreadystatechange = function () {
    if (xhrE911.readyState === 4) {
      if (xhrE911.status === 200) {
        success(JSON.parse(xhrE911.responseText));
      } else {
        error(xhrE911.responseText);
      }
    }
  };
  xhrE911.send(JSON.stringify({token: accessToken, address: address, is_confirmed: is_confirmed}));
}

// ### Create redirect_uri
function mobileNumberLogin() {
  // Attempt to authorize your mobile to make Enhanced WebRTC calls
  //window.location.href = myDHS + '/oauth/authorize?redirect_uri=' + window.location.href + 'consent.html';
  if (config.info.dhs_platform === 'PHP') { //Use PHP DHS Unverisal OAuth Callback
    window.location.href = config.oauth_callback + '?redirect_uri=' + window.location.href + '/consent.html';
  } else { //Use App specific OAuth Callback
    window.location.href = 'https://api.att.com/oauth/v4/authorize?client_id=' + config.app_key +
      '&scope=WEBRTCMOBILE&redirect_uri=' + window.location.href + '/consent.html';
  }
}

// ### Associate User
function associateUser(userId, accessToken, success, error) {
  var xhrAssociateUser = new XMLHttpRequest();

  xhrAssociateUser.open('PUT', api_endpoint + associateUser_endpoint + userId);
  xhrAssociateUser.setRequestHeader("Content-Type", "application/json");
  xhrAssociateUser.setRequestHeader("Authorization", "Bearer " + accessToken);
  xhrAssociateUser.onreadystatechange = function () {
    if (xhrAssociateUser.readyState === 4) {
      if (xhrAssociateUser.status === 204) {
        success();
      } else {
        error(xhrAssociateUser.responseText);
      }
    }
  };
  xhrAssociateUser.send();
}

// ### createSession
function createSession(accessToken, success, error) {
  var xhrCreateSession = new XMLHttpRequest();

  xhrCreateSession.open('POST', api_endpoint + 'sessions');
  xhrCreateSession.setRequestHeader("Content-Type", "application/json");
  xhrCreateSession.setRequestHeader("Accept", "application/json");
  xhrCreateSession.setRequestHeader("x-Arg", "ClientSDK=WebRTCTestAppJavascript1");
  xhrCreateSession.setRequestHeader("x-e911Id", "");
  xhrCreateSession.setRequestHeader("Authorization", "Bearer " + accessToken);
  xhrCreateSession.onreadystatechange = function () {
    if (xhrCreateSession.readyState === 4) {
      if (xhrCreateSession.status === 201) {
        success(xhrCreateSession.getResponseHeader('Location'));
      } else {
        error(xhrCreateSession.responseText);
      }
    }
  };
  xhrCreateSession.send(JSON.stringify({"session":{"mediaType":"dtls-srtp","ice":"true","services":["ip_voice_call","ip_video_call"]}}));
}


// ### logout Session
function logout(sessionId, accessToken, success, error) {
  var xhrLogoutSession = new XMLHttpRequest();

  xhrLogoutSession.open('DELETE', api_endpoint + 'sessions/'+sessionId);
  xhrLogoutSession.setRequestHeader("Content-Type", "application/json");
  xhrLogoutSession.setRequestHeader("Accept", "application/json");
  xhrLogoutSession.setRequestHeader("Authorization", "Bearer " + accessToken);
  xhrLogoutSession.onreadystatechange = function () {
    if (xhrLogoutSession.readyState === 4) {
      if (xhrLogoutSession.status === 200) {
        success();
      } else {
        error(xhrLogoutSession.responseText);
      }
    }
  };
  xhrLogoutSession.send();
}

//LongPolling
function webSocket(token, sessionId, success, error) {
  var xhrPolling = new XMLHttpRequest();
  xhrPolling.open('POST', myDHS + "/websocket");
  xhrPolling.setRequestHeader("Content-Type", "application/json");
  xhrPolling.setRequestHeader("Accept", "application/json");
  xhrPolling.onreadystatechange = function () {
    if (xhrPolling.readyState === 4) {
      if (xhrPolling.status === 200) {
        success(xhrPolling.responseText);
      } else {
        error();
        console.error(xhrPolling.responseText);
      }
    }
  };
  xhrPolling.send(JSON.stringify({'sessionId':sessionId, 'token':token}));
}

