const twilio = require('twilio');
const config = require('./config');

const accountSid = config.twilioAccountSid;
const authToken = config.twilioAuthToken;

module.exports = new twilio.Twilio(accountSid, authToken);
