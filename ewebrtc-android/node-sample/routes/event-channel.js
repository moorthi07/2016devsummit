/*jslint browser: true, devel: true, node: true, debug: true, todo: true, indent: 2, maxlen: 150, unparam: true*/
/*global require, exports*/

'use strict';

var restify = require('restify'),

//Save the active clients;
  clients = {};


function getRestClient(token) {
  var restClient = restify.createJsonClient({
    url: 'https://api.att.com/',
    userAgent: 'att-dhs',
    accept: 'application/json',
    connection: 'keep-alive',
    DTN: '1',
    headers: {
      Authorization: 'Bearer ' + token
    },
    requestTimeout: 10 * 60 * 1000,
    timeout: 5 * 60 * 300
  });

  return restClient;
}

function deleteClient(sessionId) {
  if (clients[sessionId] == undefined) {
    return;
  }

  var restClient = getRestClient(clients[sessionId].token);

  console.log('deleteClient :  ', sessionId);

  if (sessionId in clients) {
    delete clients[sessionId];
    restClient.del('RTC/v1/sessions/' + sessionId,
      function (error, req, res, result) {
        console.log("Result for delete", result);
      });
  }

}

function longPolling(data, socket) {

  var options = {},
    sessionId,
    token,
    requestPolling,
    count = 0,
    restClient;


  sessionId = data.sessionId;
  token = data.token;

  options.onTimeout = function (result) {
    // if timeout do a long polling
    requestPolling();
  };

  options.success = function (result, res) {
    count = count + 1;
    console.log(count);
    console.log('statusCode ', res.statusCode);

    if (res.statusCode == 204) {
      console.log('success: no data');
    }

    if (res.statusCode == 200) {

      console.log('success: with data');
      if (Object.keys(result).length > 0) {
        result.events.eventList.forEach(function (element) {
          try {
            socket.sendData('event', element);
          } catch (e) {
            console.log(e);
            // issue with the websocket connection; stop polling
            deleteClient(sessionId);
          }
        });

      }

    }

    if (clients[sessionId] !== undefined) {
      requestPolling();
    }
    console.log('webSocket :Success');
  };

  options.error = function (error) {
    console.log("Error () :", error);
    if (error.statusCode === 401 /* Unauthorized Request */
      || error.statusCode === 403 /* Session Id not associated with token */
      || error.statusCode === 404 /* Session is expired */
    ) {
      try {
        // attempt to send data, but recover if unable to
        socket.sendData('error', error);
      } catch (e) {
        console.log("error message not sent :", e);
      }
    } else {
      //Retry polling again
      if (clients[sessionId] !== undefined) {
        requestPolling();
      }
    }


    console.log('webSocket : Error');
  };

  requestPolling = function () {

    console.log('requestPolling() :  ', sessionId);

    restClient.get('RTC/v1/sessions/' + sessionId + '/events',
      function (error, req, res, result) {
        if (undefined !== error &&
          null !== error) {
          options.error(error);
          return;
        }

        options.success(result, res);
      });
  };

  restClient = getRestClient(token);

  //Saving the client before requesting
  clients[data.sessionId] = socket;
  console.log("Clients connected", Object.keys(clients).length);

  requestPolling();


}

exports.longPolling = longPolling;
exports.deleteClient = deleteClient;
