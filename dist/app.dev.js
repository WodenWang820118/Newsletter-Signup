"use strict";

var express = require("express");

var bodyParser = require("body-parser");

var https = require("https");

var localport = 3000;
app = express();
app.use(express["static"]("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));
/**
 * listen to the Heroku port or the localhost
 */

app.listen(process.env.PORT || localport, function (req, res) {
  console.log("The server is connected to port: " + port);
});
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/signup.html");
});
/**
 * use requests from users
 * 1. get the users' information as data from the html form: firstName, lastName, email
 * 2. get the API url, key for sending request
 * 3. get the unique list_id for adding the members
 * 4. wrap the data object as needed and make it stringified
 * 5. post the request to the Mailchimp server; use the response to see the information vis our own server
 */

app.post("/", function (req, res) {
  //console.log(typeof(res.statusCode));
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  var email = req.body.email; //the url is composed of the url and the list id
  //url: https:us7.api.mailchimp.com/3.0
  //list: /lists/da36dff08b (in Mailchimp-> settings -> scroll to the bottom)

  var url = "https:us7.api.mailchimp.com/3.0/lists/da36dff08b"; //options is for the request sent to the Mailchimp server
  //method using post because we post the data to the Mailchimp server, and send the request

  var options = {
    method: "POST",
    //api key: account -> Extras -> API keys
    auth: "GuanXin:46a61c2f47ce7ed9b7c2e31868924930-us7"
  }; //data matches the signup page with email and its status, merge_fields
  //merge_fields (audience -> settings -> Audience fields and Merge tags)

  var data = {
    //https://mailchimp.com/developer/api/marketing/list-members/add-member-to-list/
    members: [{
      //email_address is one of the required fields
      email_address: email,
      //status also has the possible values
      status: "subscribed",
      //provided in the Audience fields and Merge tags
      //can be modified or directly used by default value
      merge_fields: {
        FNAME: firstName,
        LNAME: lastName
      }
    }]
  }; //after setting the data format, make the data object into string
  //for sending the request to the Mailchimp server

  var jsonData = JSON.stringify(data); //sends the request to the Mailchimp using the url, options
  //our server listens to the data posted by users and show the imformation
  //to my server console

  var request = https.request(url, options, function (response) {
    response.on("data", function (data) {
      console.log(JSON.parse(data));

      if (response.statusCode == 200) {
        res.sendFile(__dirname + "/success.html");
      } else {
        res.sendFile(__dirname + "/failure.html"); //the route must be the same in the failure.html

        app.post("/failure", function (req, res) {
          res.redirect("/");
        });
      }
    });
  }); //the request write the jsonData to the Mailchimp and end it

  request.write(jsonData);
  request.end();
});