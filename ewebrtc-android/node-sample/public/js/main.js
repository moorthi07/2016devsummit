
/*global $, on  */


function webSocketClient(sessionId, accessToken) {

  if ("WebSocket" in window)
  {
    console.log("WebSocket is supported by your Browser!");

    // Let us open a web socket
    //HTTP
    //var ws = new WebSocket("ws://127.0.0.1:9000");
    //HTTPS
    var ws = new WebSocket("wss://127.0.0.1:9001");
    
    ws.sendData = function (event, data) {
      this.send(JSON.stringify({event: event, data: data}));
    };

    ws.onopen = function()
    {
      // Web Socket is connected, send data using send()
      ws.sendData('connected', {message : 'i am connected'});
      console.log("Message is sent...");
    };

    ws.onmessage = function (evt)
    {
      var parsedData;
      parsedData = JSON.parse(evt.data);
      
      
      if(parsedData.event === 'connected') {

        console.log("Message: Connected", parsedData);
        ws.sendData('event', {'sessionId' :sessionId, 'token': accessToken});
        
      } else if(parsedData.event === 'event') {
        console.log("Message: event", parsedData);
      }
    };

    ws.onclose = function()
    {
      // websocket is closed.
      console.log("Connection is closed...");
    };
  }

  else
  {
    // The browser doesn't support WebSocket
    console.log("WebSocket NOT supported by your Browser!");
  }
}

$(document).on('ready', function () { 
  var accessToken = '',
    sessionId = '',
    socket = null;
  
  loadConfiguration(function () {
    $('#domainName').text('@' + ewebrtc_domain);
  });

  $('#createToken').on('click', function () {
    console.log('creating Token');
    createToken(function (data) {
      console.log('created Access Token', data);
      accessToken = data.access_token;
      $("#accessToken").text(data.access_token);
      $("#associateUser").prop('disabled', false);
    },
    function () {
      console.log("error while creating access token");
    });
  });

  $('#associateUser').on('click', function () {
    var username = $('#userId').val();
    if(username === '') {
      throw Error('enter the user id');
    }
    associateUser(username, accessToken, function () {
      console.log("Associated User Successfully");
      $("#createSession").prop('disabled', false);
    },
    function () {
      console.log("error while associateUser");
    })
  });

  $('#createSession').on('click', function () {
    createSession(accessToken, function (data) {
      console.log('success create session', data);
      sessionId = data.split('/')[4];
      $("#webSocket").prop('disabled', false);
      $("#logout").prop('disabled', false);
    }, function () {
      console.log("error while createSession");
    });
  });

  $('#webSocket').on('click', function () {
      webSocket(accessToken, sessionId, function (data) {
         console.log('create a websocket ', data);
        webSocketClient(sessionId, accessToken);
      }, function () {
        
      });
  });

  $('#logout').on('click', function () {
      logout(sessionId, accessToken , function () {
          $("#associateUser").prop('disabled', true);
          $("#createSession").prop('disabled', true);
          $("#logout").prop('disabled', true);
          $("#webSocket").prop('disabled', true);
          sessionId = '';
          accessToken = '';
          $('#accessToken').val('');
      },
      function () {

      });
  });
  

});