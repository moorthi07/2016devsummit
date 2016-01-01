# Send/Receive Calls in your Android App using AT&T Enhanced WebRTC

# Introduction

One of the features that our AT&T API Platform offers is the Enhanced WebRTC API. This API enables you to integrate real-time audio/video calling into your AndroidTM app. After you log in with your Account ID or Virtual Number, your app can send and receive calls to and from any US domestic telephone number, AT&T Virtual Number or another AT&T Account ID. This article describes the prerequisites and coding steps necessary to make this happen.

For more information on the [Enhanced WebRTC API](http://developer.att.com/enhanced-webrtc/), please refer to the [AT&T API Platform](http://developer.att.com/apis) section of the [AT&T Developer portal](https://developer.att.com/).

To simplify your development, following pre-built components are provided. These can be imported into your Android App project.

- **RTCActivity** – Call management UI. This component automatically handles all media management between the caller and the call recipient. It uses the corresponding layout and resource files to bring up the call dialog.
- **RTCService** – Foreground Service and UI to respond to incoming calls

# Pre-requisite Activity

Before you can begin coding Enhanced WebRTC functionality, you must complete the following prerequisites:

  1. AT&T Developer Portal - Obtain App Key and App Secret
  2. Node Server – Configure and start your Node Server
  3. Android Studio – Set up your Project

#### 1. AT&T Developer Portal
To obtain an App Key and App Secret, complete the following steps:

  - Sign up on [https://developer.att.com](https://developer.att.com) if you are not a member yet.
  - Login to Developer Portal.
  - 3.	Set up your Account ID domain if you have not already done so.
	- Create an app in which to use the Enhanced WebRTC API.
  - Make a note of the App Key and App Secret that are generated during this process.


#### 2. Node Server

To configure and start a Node Server using the pre-built Server App, complete the following steps on the computer that contains your development environment:

  - Install NodeJS from ( [https://www.nodejs.org)](https://www.nodejs.org)). We recommend version 4.2.3 and above.
  - Follow the instructions at [https://github.com/attdevsupport/2016devsummit/tree/master/ewebrtc-android/node-sample](https://github.com/attdevsupport/2016devsummit/tree/master/ewebrtc-android/node-sample)to download a pre-built Node Server App with AT&T server-side libraries.
  - Configure this instance with the App Key and App Secret that you obtained from the AT&T Developer Portal in the previous step.
  - Configure the host and port. Use a hostname or IP address that is accessible to your Android test phone.
  - Install the node dependencies.
  - Start the Node server.

The pre-built Server App exposes an HTTPS endpoint for Access Token generation, and a WebSocket endpoint to publish Call Management events.

TIP: By default, this Server App starts at [https://127.0.0.1:9001](https://127.0.0.1:9001). This is good only for testing with Android Emulator. To test with a real device, select a hostname or IP address that is accessible to your test phone. This hostname or IP address should also be configured in 'CORS Domains' section of your Developer Portal Account.

For more information on configuring and starting the pre-built Server App, please refer to:

https://github.com/attdevsupport/2016devsummit/tree/master/ewebrtc-android/node-sample.

#### 3. Android Studio

The following example assumes that you are using Android Studio. These instructions also apply to the Eclipse IDE with the Android SDK plug-in.

**Note** : The Android library for Enhanced WebRTC has been tested on Android OS version 4.3, API Level 18 and above.


#### Steps

- Open your existing project in Android Studio, or create a new project

- Import the **webrtc-sdk.aar** archive to your project's **lib** directory
- Archive file is available at

[https://github.com/attdevsupport/2016devsummit/blob/master/ewebrtc-android/app-sample/ewebrtc-sdk/ewebrtc-sdk.aar](https://github.com/attdevsupport/2016devsummit/blob/master/ewebrtc-android/app-sample/ewebrtc-sdk/ewebrtc-sdk.aar)


- In Android Studio:

**File-> New Module -> Import .JAR/.AAR Package -> select the AAR file -> Finish**

- Add following to your project's **AndroidManifest.xml**

- Activity **RTCActivity** &Service **RTCService**

```Java
<application  ...>

 <activity android:name=".RTCActivity" />

 <service android:name=".RTCService" />
...

</application ...>
```

- Permissions
```Java
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

- Add the following Java classes from [https://github.com/attdevsupport/2016devsummit/tree/master/ewebrtc-android/app-sample/app/src/main/java/com/att/devsummit/hackathon](https://github.com/attdevsupport/2016devsummit/tree/master/ewebrtc-android/app-sample/app/src/main/java/com/att/devsummit/hackathon) to your project's **java** directory. Make sure you are preserving the folder structure as shown below:

  - ApiRequest

  - ApiService

  - RTCActivity

  - OverlayRTCFragment

  - RTCService

  - RestClient

  - Utility

- Merge all items in the folder [https://github.com/attdevsupport/2016devsummit/tree/master/ewebrtc-android/app-sample/app/src/main/res/drawable](https://github.com/attdevsupport/2016devsummit/tree/master/ewebrtc-android/app-sample/app/src/main/res/drawable) to your project's **drawable** & **values**directory.

app->res->src->drawable & app->res->src->values


- Add the following pre-built layout and fragment files in the folder [https://github.com/attdevsupport/2016devsummit/tree/master/ewebrtc-android/app-sample/app/src/main/res/layout](https://github.com/attdevsupport/2016devsummit/tree/master/ewebrtc-android/app-sample/app/src/main/res/layout) to your project's **layout** directory:

```java
activity_rtc.xml

overlay_rtc.xml
```
- Add following dependencies to the **build.gradle** file in your app:

```java

compile 'com.squareup.okhttp:okhttp:2.5.0'

compile 'com.squareup.retrofit:retrofit:1.9.0'

compile 'de.greenrobot:eventbus:2.4.0'

compile project(':ewebrtc-sdk')
```

After completing above steps, the set-up of your Android project should look like the following:

 ![](images/studio.png?raw=true)

Note: Make sure you remove the package name "com.att.devsummit.hackathon" when copying the source files to your new project.

# Code to make a Call

In your App's main activity, add the following code to:

  1. Initialize the Phone instance.
  2. Login the Phone.
  3. Make a call.
  4. Log out of the Phone.

  An example Android App illustrating the following coding steps is available at:

  [https://github.com/attdevsupport/2016devsummit/tree/master/ewebrtc-android/app-sample](https://github.com/attdevsupport/2016devsummit/tree/master/ewebrtc-android/app-sample).

  Refer to **TutorialActivity.java** in this App has the code below. You can to see how the Phone object is initialized and used.

#### 1. Initialize the Phone instance

In your App's Activity which provides a button for end user to make a call, include the following snippets in **onCreate()** method to initialize the Phone instance.

  1.1 Set URLS

Set the BaseURL and SocketURL of your Node server in the SDK.

Your Node Server's host should be accessible from your Phone where the App is installed.

```java
Constants.setBaseURL("http://your-node-server-host:port");
Constants.setSocketURl("ws://your-node-server-host:port");
ApiRequest apiRequest = new ApiRequest();
```


  1.2 Create an adapter class

Adapter class handles all the Phone events.

```java
PhoneEventAdapter phoneEventListener = new PhoneEventAdapter(){

//Necessary events to override are below.

@Override
public void onError(PhoneErrorType type, String error) {}

@Override
public void onSessionReady() {}

@Override
public void onSessionDisconnected() {}

@Override
public void onInvitationReceived(InvitationEvent event) {}

@Override
public void onCallConnected(CallConnectedEvent event) {}

@Override
public void onCallDisconnected(String callId) {}

}
```

  1.3 Initialize the Phone

Get the Phone singleton instance, and set the PhoneEventAdapter created in the previous step as the registered event listener for the Phone.

```java
Phone phone = Phone.getPhone(getApplicationContext());
phone.registerEventListener(phoneEventListener);
```

#### 2. Login the Phone

Before you can log in to the Phone, you must first obtain the Account ID domain and create an Access Token. The Account ID domain is obtained by getting the configuration data from the APIRequest object. This object invokes the Node Server URLs and is configured with the data for those URLs when it is created.

The Account ID, an alphanumeric string, is obtained from the UI when it is entered by the user.

##### 2.1 Get Configuration

Get the domain name that the Account ID should attach to.

If your domain is mydomain.com, and your user selected user1as the Account ID, this user can be reached at [user1@mydomain.com](mailto:user1@mydomain.com) using AT&T API.

String domainName;

```java
ApiRequest apiRequest = new ApiRequest();
apiRequest.getConfig(new SdkCallbacks.SuccessCallback() {
    @Override
    public void onSuccess(Object object) {
        ConfigData cData = (ConfigData) object;

 domainName = cData.getEwebrtcDomain();
        Log.d("domain", domainName );
    }
}, new SdkCallbacks.ErrorCallback() {
    @Override
    public void onError(String error) {

// Handle as required.
    }
});
```

##### 2.2 Get Access Token

Create and retrieve the oAuth AccessToken to use the Enhanced WebRTC API.

String accessToken;

```java
apiRequest.getOAuthToken(new SdkCallbacks.SuccessCallback() {
    @Override
    public void onSuccess(Object token) {
       OAuthToken ot = (OAuthToken) token;

accessToken = ot.getAccessToken();
    }
}, new SdkCallbacks.ErrorCallback() {
    @Override
    public void onError(String error) {
         // Handle as required.
    }
});
```

##### 2.3 Associate User

Associates the user-selected Id with the AccessToken

```java
Phone phone = Phone.getPhone(getApplicationContext());

// userId is collected from the UI

//

phone.associateAccessToken(userId, accessToken, new PhoneCallbacks.SuccessCallback() {
    @Override
    public void onSuccess() {
       // You can try to login now

        // phone.login( accessToken, userId );

// See below
    }
}, new PhoneCallbacks.ErrorCallback() {
    @Override
    public void onError(String error) {
           // Handle as required.
    }
});
```

##### 2.4 Login

Login with the AccessToken. This will create an Audio/Video session resource in the Enhanced WebRTC platform dedicated to this call dialog.

```java
phone.login(accessToken);
```


#### 3. Make a Call

Use the following snippet to dial audio or video call. This code is used in your App's 'dial' button click handler method.

```java
MediaType mediaType = MediaType.AUDIO;
Intent dialIntent = new Intent(getApplicationContext(), RTCActivity.class);

// Calling a US-Domestic phone number

//

mediaType = MediaType._AUDIO_;
String phoneNumber = US_DOMESTIC_PHONENUMBER_TO_DIAL;

String validPhoneNumber = CLEANED_TO_1AAABBBCCCC_FORMAT;

dialIntent.putExtra("DESTINATION", "tel:" + validPhoneNumber);
dialIntent.putExtra("MEDIATYPE", mediaType);
startActivity(dialIntent);

// Calling another Account Id

// calleeDomain can be any other AccountId domain

//

mediaType = MediaType._AUDIO_VIDEO_;
String idToCall = CALLEE_ACCOUNT_ID;
dialIntent.putExtra("DESTINATION", "sip:" + idToCall + '@' + calleeDomain);

dialIntent.putExtra("MEDIATYPE", mediaType);
startActivity(dialIntent);

```

#### 4. Logout (Optional)

You only need to use this line if you are designing a 'Logout' button in your App. The Logout method clears up the Session resource in the API platform.

```java
phone.logout();
```

TIP: Above code is optional if you are using the foreground service provided by the library. This service will automatically logout the Session as needed.


# Code to Answer/Reject an Incoming Call

You can also make your App receive calls when a Caller makes an audio/video call to this App's Account Id.

A pre-built Foreground Service **RTCService** along with Accept/Reject button UI is provided in the Sample. To use this in your App, perform the following steps.

**Note** : These steps have a dependency on **RTCActivity**. Ensure that the **RTCActivity** configuration steps are successfully completed before starting with the following.

## Steps 

- Open your existing project in Android Studio

- Add **RTCService** to your project's **AndroidManifest.xml**

```java
<application ... >

  <service android:name=".RTCService" />

  ...

</application>
```

## Further Information
1. AT&T Developer Platform
https://developer.att.com

2. Enhanced WebRTC API
https://developer.att.com/enhanced-webrtc

3. Android Sample
https://github.com/attdevsupport/2016devsummit/ewebrtc-android/app-sample

4. JavaScript SDK
https://developer.att.com/enhanced-webrtc/sdk



~END~
