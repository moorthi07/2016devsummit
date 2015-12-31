# Send/Receive Calls in your iOS App using AT&T Enhanced WebRTC

## Introduction
One of the features that our AT&T API Platform offers is the Enhanced WebRTC
API. This API enables you to integrate real-time audio/video calling into your
iOS app. After you log in with your Account ID or Virtual Number, your app
can send and receive calls to and from any US domestic telephone number, AT&T
Virtual Number or another AT&T Account ID. This article describes the
prerequisites and coding steps necessary to make this happen.

For more information on the [Enhanced WebRTC API](http://developer.att.com/enhanced-webrtc/),
please refer to the [AT&T API Platform](http://developer.att.com/apis) section
of the [AT&T Developer portal](https://developer.att.com/).

To simplify your development, the following pre-built components are provided.
These can be imported into your iOS App project.

- **Phone** – Class used to handle media and networking. Functionality includes
  starting a session, starting a call, accepting a call, ending a call.
- **WebRTCListener** – Class used to handle WebRTC events, such as an incoming
  call.
- **DhsService** - Class used to interact with the Developer Hosted Server
  (DHS).

## Prerequisite Activity
Before you can begin coding Enhanced WebRTC functionality, you must complete the
following prerequisites:

  1. AT&T Developer Portal - Obtain App Key and App Secret
  2. Node Server – Configure and start your Node Server
  3. Xcode – Set up your Project

### 1. AT&T Developer Portal
To obtain an App Key and App Secret, complete the following steps:

  - Sign up on [https://developer.att.com](https://developer.att.com) if you are
    not a member yet.
  - Login to Developer Portal.
  - Set up your Account ID domain if you have not already done so.
  - Create an app in which to use the Enhanced WebRTC API.
  - Make a note of the App Key and App Secret that are generated during this
    process.


### 2. Node Server
To configure and start a Node Server using the pre-built Server App, complete
the following steps on the computer that contains your development environment:

  - Install NodeJS from ( [https://www.nodejs.org)](https://www.nodejs.org)). We
    recommend version 4.2.3 and above.
  - Follow the instructions at
    [https://github.com/attdevsupport/2016devsummit/tree/master/ewebrtc-ios/node-sample](https://github.com/attdevsupport/2016devsummit/tree/master/ewebrtc-ios/node-sample)
    to download a pre-built Node Server App with AT&T server-side libraries.
  - Configure this instance with the App Key and App Secret that you obtained
    from the AT&T Developer Portal in the previous step.
  - Configure the host and port. Use a hostname or IP address that is accessible
    to your Android test phone.
  - Install the node dependencies.
  - Start the Node server.

The pre-built Server App exposes an HTTPS endpoint for Access Token generation,
and a WebSocket endpoint to publish Call Management events.

TIP: By default, this Server App starts at
[https://127.0.0.1:9001](https://127.0.0.1:9001). This is good only for testing
with Android Emulator. To test with a real device, select a hostname or IP
address that is accessible to your test phone. This hostname or IP address
should also be configured in 'CORS Domains' section of your Developer Portal
Account.

For more information on configuring and starting the pre-built Server App, please refer to:

https://github.com/attdevsupport/2016devsummit/tree/master/ewebrtc-ios/node-sample.

### 3. Xcode

The following example assumes that you are using Xcode. 

**Note** : The iOS library for Enhanced WebRTC has been tested on iOS version
9.0 and higher. The library has been compiled against the ARM64 architecture, so
and IPhone 5s or newer is required. Running this tutorial app will not work on a
simulator.

The tutorial app has been configured to run as-is, so simply opening the
TutorialApp.xcworkspace directory in the
[Github repow](https://github.com/attdevsupport/2016devsummit/tree/master/ewebrtc-ios/TutorialApp)
should be all that is needed to run the app.

By default, the tutorial app is configured to use an example Developer Hosted
Server already being hosted. However, you may modify the app to hit your own DHS
by updating the following two files:

**AppDelegate.swift**
```Swift
private static let SOCKET_FQDN = "ENTER_VALUE"
```

**ViewController.swift**
```Swift
private let DHS_FQDN = "ENTER_VALUE"
```

## Code to Make and Receive Calls


### Setting up your AppDelegate
In order to make and receive calls, you must first set up your application
delegate with the functionality to listen to events. At the top of your
AppDelegate class, add the following lines:
```Swift
private static let SOCKET_FQDN = "ENTER_FQDN"
private var webrtcListener: WebRTCListener!
```
You will also need to add a method in your AppDelegate class to start polling:
```Swift
func startPolling(token: OAuthToken, sessionId: String) {
    self.webrtcListener = WebRTCListener(
        websocketFqdn: AppDelegate.SOCKET_FQDN, token: token, sessionId: sessionId
    )
    self.webrtcListener.startPolling()
}
```
Furthermore, you must register for user notifications and pass any notifications
to the WebRTCListener instance. For example:
```Swift
func application(application: UIApplication,
    didReceiveLocalNotification: UILocalNotification)
{
    NSLog("AppDelegate(): received notification")
    WebRTCListener.receiveNotification(didReceiveLocalNotification)
}

func application(application: UIApplication, didFinishLaunchingWithOptions launchOptions: [NSObject: AnyObject]?) -> Bool {
    // Register user notification settings
    let settings: UIUserNotificationSettings = UIUserNotificationSettings(
        forTypes: [.Badge, .Alert, .Sound], categories: nil
    )
    application.registerUserNotificationSettings(settings)
    
    return true
}
```
You may also look at an example
[AppDelegate](https://github.com/attdevsupport/2016devsummit/blob/ios/ewebrtc-ios/TutorialApp/TutorialApp/AppDelegate.swift) class.


### Setting up your Phone instance
Now that the AppDelegate class has been set up, you can start making calls.  In
order to make a call, you must first instantiate the DhsService class:
```Swift
let dhsService = DhsService(fqdn: DHS_FQDN)
```
 You must then get the configuration values from the DHS:
```Swift
dhsService.getConfig(
    { (configData: ConfigData) in
      // handle configuration data
    } , errorCallback: { (error: NSError?) in
      // handle error
    }
)

```
After getting the configuration values from the DHS, you will need to get an
OAuth token from the DHS, which you will then use to create a Phone object.
```Swift

var phone: Phone? = nil
dhsService.getToken(
    { (token: OAuthToken) in
        phone = Phone(fqdn: "https://api.att.com", token: token)
    }, errorCallback: { (error: NSError?) in
        self.handleNSError(error)
    }
)

```
To get phone call events, you must create a PhoneCallDelegate and assign to the
phone instance.

```Swift
class YourCallDelegate : PhoneCallDelegate {
    func onConnectionOpen() {
        // when a call connection is opened
    }

    func onConnectionClosed() {
        // when a call connection is closed
    }

    func onLocalVideoTrack(localVideoTrack: RTCVideoTrackWrapper) {
        // when a local video stream is obtained
    }

    func onRemoteVideoTrack(remoteVideoTrack: RTCVideoTrackWrapper) {
        // when a remote video stream is obtained
    }

    func onError(error: String) {
        // when an error has occured
    }
}

// assign delegate to phone instance
let yourCallDelegate = YourCallDelegate()
phone.callDelegate = yourCallDelegate
```

You can now log in using the phone instance. After you successfully log in, you
must start polling for events":

```Swift
let userId = "Alice"
self.phone?.login(userId,
    successCallback: { () in
        let appDelegate: AppDelegate = UIApplication.sharedApplication().delegate as! AppDelegate
        let sessionId = self.phone!.getActiveSessionId()
        appDelegate.startPolling(self.token!, sessionId: sessionId!)
        // any other code
    }, errorCallback: { (error: NSError?) in
        // handle error
    }
)
```

### Making a call

You may now place a call:

```Swift
let destination = "sip:Bob@example.com"
 phone.dial(destination,
    successCallback: { () in
        // handle success
    }, errorCallback: { (error: NSError?) in
        // handle error
    }
)
```

### Receiving a call

In order to receive a call, you must create implement  PhoneInvitationDelegate
protocol and assign the implemented class to the phone instance:

```Swift
class YourInvitationDelegate : PhoneCallDelegate {
    func onInvitationEvent(from: String, callId: String) {
        // handle invitation event by either using phone.reject() or
        // phone.answer()
    }
}

// assign delegate to phone instance
let yourInvitationDelegate  = YourInvitationDelegate()
phone.invitationDelegate = yourInvitationDelegate
```

## Further Information
1. AT&T Developer Platform
https://developer.att.com

2. Enhanced WebRTC API
https://developer.att.com/enhanced-webrtc

3. IOS Sample
https://github.com/attdevsupport/2016devsummit/ewebrtc-IOS/TutorialApp/

4. JavaScript SDK
https://developer.att.com/enhanced-webrtc/sdk
