//
//  ViewController.swift
//  TutorialApp
//
//  Created by DRT Dev on 12/30/15.
//  Copyright © 2015 AT&T. All rights reserved.
//

import UIKit
import EWebRTC

class ViewController: UIViewController, UITextFieldDelegate, PhoneInvitationDelegate {
    @IBOutlet weak var stepZeroView: UIStackView!
    @IBOutlet weak var stepOneView: UIStackView!
    @IBOutlet weak var stepTwoView: UIStackView!
    @IBOutlet weak var stepThreeView: UIStackView!
    @IBOutlet weak var stepFourView: UIStackView!
    @IBOutlet weak var receivingLabel: UILabel!
    
    @IBOutlet weak var userIdField: UITextField!
    @IBOutlet weak var destinationField: UITextField!
    
    @IBOutlet weak var getConfigButton: UIButton!
    @IBOutlet weak var getTokenButton: UIButton!
    @IBOutlet weak var phoneLoginButton: UIButton!
    @IBOutlet weak var phoneDialButton: UIButton!
    @IBOutlet weak var phoneLogoutButton: UIButton!
    
    // This value can be changed to your local DHS
    private let DHS_FQDN = "https://devsummit-ewebrtc.herokuapp.com"
    
    private var busy: UIActivityIndicatorView!
    private var ewebrtcDomain: String?
    private var token: OAuthToken?
    private var dhsService: DhsService?
    private var phone: Phone?
    private var offerCallId: String?
    
    private func resetView() {
        self.getConfigButton.enabled = true
        self.getTokenButton.enabled = true
        self.phoneLoginButton.enabled = true
        self.phoneDialButton.enabled = true
        self.phoneLogoutButton.enabled = true
        stepOneView.hidden = true
        stepTwoView.hidden = true
        stepThreeView.hidden = true
        stepFourView.hidden = true
        receivingLabel.hidden = true
        if let phone = self.phone {
            if phone.getPhoneState() == PhoneState.LOGGED_IN {
                phone.logout({() in
                    
                    }, errorCallback: { (error: NSError?) in
                        
                    }
                )
            }
        }
    }
    
    private func showErrorDialog(error: String) {
        let alert = UIAlertController(title: "Error", message: error, preferredStyle: UIAlertControllerStyle.Alert)
        alert.addAction(UIAlertAction(title: "OK", style: UIAlertActionStyle.Default, handler: nil))
        self.presentViewController(alert, animated: true, completion: nil)
    }
        
    private func handleNSError(error: NSError?) {
        let message: String = error == nil ? "Unknown Error" : "\(error)"
        self.showErrorDialog(message)
        self.busy.stopAnimating()
        self.resetView()
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.navigationController!.setNavigationBarHidden(true, animated: true)
        self.userIdField.delegate = self
        self.destinationField.delegate = self
        self.busy = UIActivityIndicatorView(activityIndicatorStyle: .Gray)
        self.busy.center = self.view.center
        self.busy.hidesWhenStopped = true
        self.view.addSubview(busy)
        self.resetView()
        // Do any additional setup after loading the view, typically from a nib.
    }
    
    override func viewWillAppear(animated: Bool) {
        NSLog("ViewController(): viewWillAppear")
        super.viewWillAppear(animated);
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    @IBAction func getConfigClick(sender: UIButton) {
        self.dhsService = DhsService(fqdn: DHS_FQDN)
        self.busy.startAnimating()
        self.getConfigButton.enabled = false
        self.dhsService?.getConfig(
            { (configData: ConfigData) in
                self.ewebrtcDomain = configData.ewebrtcDomain
                self.stepOneView.hidden = false
                self.busy.stopAnimating()
            } , errorCallback: { (error: NSError?) in
                self.handleNSError(error)
            }
        )
    }

    @IBAction func getTokenClick(sender: UIButton) {
        self.busy.startAnimating()
        self.getTokenButton.enabled = false
        self.dhsService?.getToken(
            { (token: OAuthToken) in
                self.token = token
                self.stepTwoView.hidden = false
                self.busy.stopAnimating()
            }, errorCallback: { (error: NSError?) in
                self.handleNSError(error)
            }
        )
    }
    
    @IBAction func loginClick(sender: UIButton) {
        let fqdn = "https://api.att.com"
        self.phone = Phone(fqdn: fqdn, token: self.token!)
        self.phone?.invitationDelegate = self
        let userId = self.userIdField.text
        self.busy.startAnimating()
        self.phoneLoginButton.enabled = false
        self.phone?.login(userId!,
            successCallback: { () in
                self.stepThreeView.hidden = false
                self.stepFourView.hidden = false
                self.destinationField.text = "Bob@" + self.ewebrtcDomain!
                self.receivingLabel.text = "User: \(userId!)@\(self.ewebrtcDomain!)"
                self.receivingLabel.hidden = false
                self.busy.stopAnimating()
                let appDelegate: AppDelegate = UIApplication.sharedApplication().delegate as! AppDelegate
                let sessionId = self.phone!.getActiveSessionId()
                appDelegate.startPolling(self.token!, sessionId: sessionId!)
            }, errorCallback: { (error: NSError?) in
                self.handleNSError(error)
            }
        )
    }
    
    @IBAction func dialClick(sender: UIButton) {
        self.performSegueWithIdentifier("VideoSegue", sender: self)
    }
    
    @IBAction func logoutClick(sender: UIButton) {
        self.phoneLogoutButton.enabled = false
        self.phoneDialButton.enabled = false
        phone!.logout(
            {() in
                self.resetView()
            }, errorCallback: { (error: NSError?) in
                self.handleNSError(error)
            }
        )
    }
    
    // MARK: - Navigation
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        NSLog("viewController() prepareForSegue()")
        let videoController = segue.destinationViewController as! VideoViewController
        videoController.phone = self.phone
        if (self.offerCallId != nil) {
            videoController.offerCallId = self.offerCallId
            self.offerCallId = nil
        } else {
            videoController.destination = self.destinationField.text
            NSLog("viewController() destinationField: \(videoController.destination)")
        }
    }
    
    // MARK: UITextFieldDelegate
    func textFieldShouldReturn(textField: UITextField) -> Bool {
        textField.resignFirstResponder()
        return true
    }
    
    func textFieldDidEndEditing(textField: UITextField) {
    }
    
    // MARK: PhoneInvitationDelegate
    func onInvitationEvent(from: String, callId: String) {
        let message: String? = "Incoming call"
        let callAlert = UIAlertController(title: "from: \(from)", message: message, preferredStyle: UIAlertControllerStyle.ActionSheet)
        
        callAlert.addAction(UIAlertAction(title: "Accept", style: UIAlertActionStyle.Default,
            handler: { (alert: UIAlertAction!) in
                UIApplication.sharedApplication().cancelAllLocalNotifications()
                self.offerCallId = callId
                self.performSegueWithIdentifier("VideoSegue", sender: self)
        }))
        
        callAlert.addAction(UIAlertAction(title: "Reject", style: UIAlertActionStyle.Default,
            handler: { (alert: UIAlertAction!) in
                UIApplication.sharedApplication().cancelAllLocalNotifications()
                self.phone?.rejectCall(callId, successCallback:
                    { () in
                        NSLog("Successfully rejected call (\(callId))")
                    }, errorCallback:
                    { (error: NSError?) in
                        NSLog("\(error)")
                    }
                )
        }))
        
        self.presentViewController(callAlert, animated: true, completion: nil)
    }
}

