const admin = require('firebase-admin');
const twilio = require('./twilio');
const config = require('./config');

const generateRandom4DigitCode = () => {
  return Math.floor(Math.random() * 8999 + 1000);
};

const sendTwilioMessage = (to, body) => {
  return new Promise((resolve, reject) => {
    twilio.messages.create({
      body: body,
      to: to,
      from: config.twilioPhone
    }, (err) => {
      if (err) {
        reject(err);
      }
      else {
        resolve();
      }
    });
  });
};

const saveCodeForUser = (userPhone, code) => {
  return new Promise((resolve, reject) => {
    admin.database().ref('users/' + userPhone)
      .update({ code: code, codeValid: true }, () => {
        resolve();
      });
  });
};

module.exports = function(req, res) {
  if (!req.body.phone) {
    return res.status(422).send({ error: 'No phone number provided'});
  }

  const phone = String(req.body.phone).replace(/[^\d]/g, '');
  const code = generateRandom4DigitCode();
  const message = 'Your code is: ' + code;

  admin.auth().getUser(phone)
    .then(user => {
      return sendTwilioMessage(phone, message);
    })
    .then(() => {
      return saveCodeForUser(phone, code);
    })
    .then(() => {
      res.send({ success: true });
    })
    .catch(err => {
      console.log(err);
      res.status(422).send({ error: "Something went wrong" });
    });
};
