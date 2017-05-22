const admin = require('firebase-admin');

const getUserSnapshotFromDatabase = (ref) => {
  return new Promise((resolve, reject) => {
    ref.once(
      'value',
      snapshot => resolve(snapshot.val()),
      error => reject(error)
    );
  });
};

module.exports = function(req, res) {
  if (!req.body.phone || !req.body.code) {
    return res.status(422).send({ error: 'No phone or code provided'});
  }

  const phone = String(req.body.phone).replace(/[^\d]/g, '');
  const code = parseInt(req.body.code);
  const ref = admin.database().ref('users/' + phone);

  admin.auth().getUser(phone)
    .then(() => {
      return getUserSnapshotFromDatabase(ref);
    })
    .then(user => {
      ref.update({ codeValid: false });
      return admin.auth().createCustomToken(phone);
    })
    .then(jsonWebToken => {
      res.send({ token: jsonWebToken });
    })
    .catch(err => {
      console.log(err);
      res.status(422).send({ error: 'Something went wrong' });
    });
};
