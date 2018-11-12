var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pure-archive-217204.firebaseio.com"
});

const db = admin.firestore();
const fs = require("fs");
const csvSync = require("csv-parse/lib/sync");
const file = "./data.csv";
let data = fs.readFileSync(file);
let responses = csvSync(data);

// convert CSV data into objects
let objects = [];

responses.forEach(function(response) {
  objects.push({
    date: response[0],
    yearmonth: response[1],
    weekday: response[2],
    worker_id: response[3],
    clock_in_at: response[4],
    clock_out_at: response[5],
    rest_time: response[6],
    comment: response[7]
  });
}, this);

// set the data from objects
return db
  .runTransaction(function(transaction) {
    return transaction.get(db.collection("kintai")).then(doc => {
      objects.forEach(function(object) {
        transaction.set(db.collection("kintai").doc(), object);
      }, this);
    });
  })
  .then(function() {
    console.log("Success!");
  })
  .catch(function(error) {
    console.log("Failed", error);
  });
