var express = require('express'),
  fs = require('fs'),
  http = require('http'),
  https = require('https'),
  favicon = require('static-favicon'),
  bodyParser = require('body-parser'),
  passport = require('passport'),
  UniqueTokenStrategy = require('passport-unique-token').Strategy,
  jsonfile = require('jsonfile'),

  jade = require('jade'),

  app,
  pkg,
  att,
  http_port,
  https_port,
  cors_domains,
  cert_file,
  key_file,
  privateKey,
  certificate,
  api_env,
  app_key,
  app_secret,
  oauth_callback,
  virtual_numbers_pool,
  ewebrtc_domain,
  env_config,
  is_heroku_env;

//--------------------------------------------------------
// SECTION: Initialize configuration
//--------------------------------------------------------
// Following are calculated after required configuration
// entries are read or defaulted.
//
//--------------------------------------------------------
pkg = require('./package.json');

is_heroku_env = true;

if (is_heroku_env) {

  http_port = process.env.PORT;
  console.info('Using HTTP PORT ', http_port);

} else {

  http_port = process.env.HTTP_PORT || pkg.http_port;
  console.info('Using HTTP PORT ', http_port);

  https_port = process.env.HTTPS_PORT || pkg.https_port;
  console.info('Using HTTPS PORT ', https_port);

}

cors_domains = process.env.CORS_DOMAINS || pkg.cors_domains;
console.info('Domains to add in CORS Headers: ', cors_domains);

cert_file = process.env.CERT_FILE || pkg.cert_file;
key_file = process.env.KEY_FILE || pkg.key_file;
console.info('Using SSL Configuration - Certificate: ', cert_file, 'Key File: ', key_file);

api_env = process.argv[2] || process.env.API_ENV || pkg.default_api_env;
console.info('Using API Env : ', api_env);

env_config = pkg[api_env];
env_config.api_env = api_env;

app_key = env_config.app_key;
app_secret = env_config.app_secret;
oauth_callback = env_config.oauth_callback;
virtual_numbers_pool = env_config.virtual_numbers_pool;
ewebrtc_domain = env_config.ewebrtc_domain;

if (!app_key || !app_secret) {
  console.error('Insufficient App Configuration');
  console.error('Entries app_key, app_secret are mandatory');
  console.error('Exiting...');
  process.exit(1);
}

if ('YourAppKey' === app_key || 'YourAppSecret' === app_secret) {
  console.error('Invalid app_key or app_secret');
  console.error('Entries app_key or app_secret are not set');
  console.error('Exiting...');
  process.exit(1);
}

console.info('#####################################################');
console.info('        Using App Key: ', app_key);
console.info('     Using App Secret: ', app_secret);
console.info('#####################################################');

if (oauth_callback) {
  console.info('OAuth Callback URL: ', oauth_callback);
} else {
  console.info('OAuth callback is NOT configured. You can not use mobile numbers');
}
console.info('#####################################################');

if (virtual_numbers_pool) {
  console.info('Using Virtual Number Pool:');
  console.info(virtual_numbers_pool);
} else {
  console.info('Virtual numbers pool is NOT configured. You can not user virtual numbers');
}
console.info('#####################################################');

if (ewebrtc_domain) {
  console.info('EWebRTC domain:');
  console.info(ewebrtc_domain);
} else {
  console.info('EWebRTC domain is NOT configured.');
}
console.info('#####################################################');

//--------------------------------------------------------
// END SECTION: Initialize configuration
//--------------------------------------------------------


//--------------------------------------------------------
// SECTION: start of action
//--------------------------------------------------------
// Configuration is all ready. We are good to go.
//
//--------------------------------------------------------

// Handle this process just in case...
// so that the Log strems are not corrupted
//
process.on('SIGUSR2', function () {
  console.info('Signal SIGUSR2 received. Reopening log streams...');
});

// ---------------------------------------------
// BEGIN: Boiler-plate Express app set-up
// ---------------------------------------------
//

// privateKey = fs.readFileSync('sample.key', 'utf8');
// certificate = fs.readFileSync('sample.cert', 'utf8');

app = express();

// View Engine setup

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Middleware

app.use(favicon());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/js', express.static(__dirname + '/js'));
app.use('/assets', express.static(__dirname + '/assets'));

// app.use('/', express.static(__dirname + '/public'));

att = require('./routes/att');
att.initialize(env_config, app);

function findByUsernameInCollection( user, users ) {
  for(var i=0; i<users.length; i++) {
    if(user === users[i].username) {
      return users[i];
    }
  }
}

app.get('/schedules', function( req, res, next) {
	res.send(require('./db').schedules);
});

app.get('/patients', function( req, res, next) {
	res.send(require('./db').patients);
});

app.get('/uuids', function( req, res, next ) {
	res.send( require('./db/tokens.json') );
});

app.delete('/uuids', function( req, res, next ) {
	var emptyTokens = {};
	saveTokens( emptyTokens );
	console.log('cleaned up all tokens');
	res.status(200).json({});
});


app.get('/patients/:username', function( req, res, next) {
  var patients = require('./db').patients;
  var patient = findByUsernameInCollection(req.params.username, patients);
  patient ? res.send(patient) : res.send({});
});

app.get('/providers', function( req, res, next) {
  res.send(require('./db').providers);
});

app.get('/providers/:username', function( req, res, next) {
  var providers = require('./db').providers;
  var provider = findByUsernameInCollection(req.params.username, providers);
  provider ? res.send(provider) : res.send({});
});

app.get('/appointments', function( req, res, next) {
	var schedules = require('./db').schedules;
  var patients = require('./db').patients;

  var appointments = [];
  schedules.forEach(function(schedule) {
    var patient = findByUsernameInCollection( schedule.username, patients );
    if( patient ) {

     var appointment = {};

     appointment.firstName = patient.firstName;
     appointment.lastName = patient.lastName;
     appointment.at = schedule.at;
     appointment.contacts = patient.contacts;

     appointments.push(appointment);
   }
 });
  res.send(appointments);
});

app.get('/', function(req, res, next) {
  res.render('index.jade');
});

app.get('/pre', function(req, res, next) {
  res.render('pre.jade');
});

app.get('/phone', function(req, res, next) {
  res.render('phone.jade');
});

app.get('/call', function(req, res, next) {
  res.render('call.jade');
});

app.get('/vtn', function(req, res, next) {
  res.render('vtn.jade');
});

app.get('/notn', function(req, res, next) {
  res.render('notn.jade');
});

app.get('/expired', function(req, res, next) {
  res.render('expired.jade');
});

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(patient, done) {
  console.log('serializeUser: ', patient.username);
  done(null, patient.username);
});

passport.deserializeUser(function(username, done) {

  console.log('deserializeUser: ', JSON.stringify(token));

  var patients = require('./db').patients;
  var patient = findByUsernameInCollection(username, patients);
  console.log( 'Patient: ', JSON.stringify(patient));

  done(null, patient);

});


passport.use(new UniqueTokenStrategy(

  function(token, done) {

    var tokens = require('./db/tokens.json');

    if( tokens[token] && tokens[token].active === true ) {
      console.log( 'Token is active: ', token);
      console.log( 'Info: ', JSON.stringify(tokens[token]));
      
      var patients = require('./db').patients;
      var patient = findByUsernameInCollection(tokens[token].username, patients);
      console.log( 'Patient: ', JSON.stringify(patient));

      tokens[token].active = false;
      saveTokens(tokens);

      return done( null, patient );
    }

    if( tokens[token] && tokens[token].active === false ) {
      console.log( 'Token expired: ', token);
      return done( null, false, { message: 'Token expired' } );
    }

    console.log( 'Token not found in DB');
    return done( new Error( 'Invalid token') );

  }

));

function saveTokens( tokens ) {
  var file = './db/tokens.json';
  jsonfile.writeFileSync(file, tokens, {spaces: 2});
	console.log( 'Persisted uuid token' );
}

app.get('/auth', passport.authenticate('token', {failureRedirect: '/expired'} ), function(req, res) {
  res.render( 'vvisit.jade' );
});


var nodemailer = require('nodemailer');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'att.drt.sdk@gmail.com',
        pass: 'tiqayghpjkfuzvzi'
    }
});

// NB! No need to recreate the transporter object. You can use
// the same transporter object for all e-mails

// setup e-mail data with unicode symbols
var mailOptions = {
    from: 'Telemed Admin<appointments@telemedicine.com>', // sender address
    to: 'clear.viewer@hotmail.com', // list of receivers
    subject: 'Your Appointment with Telemedicine\'s Doctor', // Subject line
    html: '' // html body
};

var uuid = require('node-uuid');

app.post('/emails', function(req, res, next){

  var patients = require('./db').patients;
  var patient = findByUsernameInCollection( req.body.username, patients);
  if(patient.contacts.email) {
    mailOptions.to = patient.contacts.email;
  } else {
    console.log('Email Id unavailable for ', req.body.username);
    res.send(404);
    return;
  }

  var hostPort = 'https://ewebrtc-tracksession.herokuapp.com';
  var authUri = '/auth';
  var token = uuid.v4();
	console.log( 'Created token uuid' );

  var tokens = require('./db/tokens.json');
  tokens[token] = {};
  
  tokens[token].username = req.body.username;
  tokens[token].active = true;

  saveTokens(tokens); 
  
  var html = '<h2>Provider</h2>';
  html += req.body.doctor;
  html += '<h3>Date and Time</h3>';
  html += req.body.time;
  html += '<h3>Instructions</h3>Open the following link in your <em>Chrome</em> browser.<p/>';
  html += '<a href="' + hostPort + authUri + '?' + 'token=' + token + '&username=' + req.body.username + '">Click to receive call from your provider at the time above.</a><p/>';
  html += '<b>NOTE:</b>This is one-time only link. <em>Expires after first use.</em>';
  mailOptions.html = html;

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(err, info){
    if(err) {
      console.log( 'Error sending email: ', err);
      res.send(err);
    } else {
      console.log('Message sent: ' + info.response);
      res.send(200);
    }

  });

});

// PROD error handler
// No stacktraces shown to end user.
//
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

//
// Create web servers - HTTP and HTTPS
//

http.createServer(app).listen(http_port);
console.log('HTTP web server listening on port ' + http_port);

if (!is_heroku_env) {
  https.createServer({
    key: privateKey,
    cert: certificate
  }, app).listen(https_port);
  console.log('HTTPS web server listening on port ' + https_port);
}

