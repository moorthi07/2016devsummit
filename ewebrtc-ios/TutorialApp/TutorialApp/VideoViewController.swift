//
//  ViewController.swift
//  TutorialApp
//
//  Created by DRT Dev on 12/30/15.
//  Copyright © 2015 AT&T. All rights reserved.
//

import UIKit
import EWebRTC

class VideoViewController: UIViewController, PhoneCallDelegate {
    @IBOutlet weak var remoteView: RTCEAGLVideoViewWrapper!
    @IBOutlet weak var localView: RTCEAGLVideoViewWrapper!
    
    var localVideoTrack: RTCVideoTrackWrapper!
    var remoteVideoTrack: RTCVideoTrackWrapper!
    
    var phone: Phone?
    var destination: String?
    var offerCallId: String?
    var disconnectCalled: Bool?
    
    var errorMessage: String?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
    }
    
    override func viewWillAppear(animated: Bool) {
        super.viewWillAppear(animated);
        
        self.phone!.callDelegate = self
        if let callId = self.offerCallId {
            self.phone?.answerCall(callId,
                successCallback: { () in
                    self.offerCallId = nil
                }, errorCallback: { (error: NSError?) in
                    self.errorMessage = "\(error)"
                    self.disconnect()
                    self.offerCallId = nil
                }
            )
        } else {
            NSLog("destination: \(self.destination!)")
            var modifiedDest: String = self.destination!
            if modifiedDest.containsString("@") {
                if !modifiedDest.hasPrefix("sip:") {
                    modifiedDest = "sip:" + modifiedDest
                }
            } else { // tel:
            }
            self.phone?.dial(modifiedDest,
                successCallback: { () in
                }, errorCallback: { (error: NSError?) in
                    self.errorMessage = "\(error)"
                    NSLog(self.errorMessage!)
                    self.disconnect()
                }
            )
        }
        self.disconnectCalled = false
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    private func disconnect() {
        NSLog("Disconnect called")
        if self.disconnectCalled! {
            return
        }
        // reset values
        self.destination = nil
        self.offerCallId = nil
        
        self.disconnectCalled = true
        self.phone?.endCall(
            { () in
                // don't need to anything special here for now
            }, errorCallback: { (error: NSError? ) in
            }
        )
 
        if self.localVideoTrack != nil {
            self.localVideoTrack.getVideoTrack().removeRenderer(self.localView)
        }
        if self.remoteVideoTrack != nil {
            self.remoteVideoTrack.getVideoTrack().removeRenderer(self.remoteView)
        }
        self.localVideoTrack = nil
        self.localView.renderFrame(nil)

        self.remoteVideoTrack = nil
        self.remoteView.renderFrame(nil)
        self.navigationController!.popViewControllerAnimated(true)
    }
    
    // MARK: PhoneCallDelegate
    func onConnectionOpen() {
    }
    
    func onConnectionClosed() {
        self.disconnect()
    }
    
    func onLocalVideoTrack(localVideoTrack: RTCVideoTrackWrapper) {
        if (self.localVideoTrack != nil) {
            self.localVideoTrack.getVideoTrack().removeRenderer(self.localView)
            self.localVideoTrack = nil
            self.localView.renderFrame(nil)
        }
        self.localVideoTrack = localVideoTrack
        self.localVideoTrack.getVideoTrack().addRenderer(self.localView)
    }
    
    func onRemoteVideoTrack(remoteVideoTrack: RTCVideoTrackWrapper) {
        self.remoteVideoTrack = remoteVideoTrack;
        NSLog("remoteVideoTrack: \(remoteVideoTrack)")
        self.remoteVideoTrack.getVideoTrack().addRenderer(self.remoteView)
    }
    
    func onError(error: String) {
        self.errorMessage = error
        self.disconnect()
    }
    
    @IBAction func endCallClick(sender: UIButton) {
        NSLog("endCallClick()")
        self.disconnect()
    }
    
    // MARK: - Navigation
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        NSLog("videoViewController() prepareForSegue()")
        if self.errorMessage != nil {
            let viewController = segue.destinationViewController as! ViewController
            viewController.errorMessage = self.errorMessage
            self.errorMessage = nil
        }
    }
}