const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const port = 3000;

app = express();

app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended:true}));

app.listen(port, function(req, res){
    console.log("The server is connected to port: " + port);
});

app.get("/", function(req, res){
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
app.post("/", function(req, res){
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    //the url is composed of the url and the list id
    //url: https:us7.api.mailchimp.com/3.0
    //list: /lists/da36dff08b (in Mailchimp-> settings -> scroll to the bottom)
    const url = "https:us7.api.mailchimp.com/3.0/lists/da36dff08b";

    //options is for the request sent to the Mailchimp server
    //method using post because we post the data to the Mailchimp server, and send the request
    const options = {
        method: "POST",
        auth: "GuanXin:9672dd01ae066c25b4231a9c908a51ef-us7"
    }

    //data matches the signup page with email and its status, merge_fields
    //merge_fields (audience -> settings -> Audience fields and Merge tags)
    const data = {
        //https://mailchimp.com/developer/api/marketing/list-members/add-member-to-list/
        members: [
            {
                //email_address is one of the required fields
                email_address:email,
                //status also has the possible values
                status: "subscribed",
                //provided in the Audience fields and Merge tags
                //can be modified or directly used by default value
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName
                }
            }
        ]
    }
    //after setting the data format, make the data object into string
    //for sending the request to the Mailchimp server
    const jsonData = JSON.stringify(data);

    //sends the request to the Mailchimp using the url, options
    //our server listens to the data posted by users and show the imformation
    //to my server console
    const request = https.request(url, options, function(response){
        response.on("data", function(data){
            console.log(JSON.parse(data));
        })
    });

    //the request write the jsonData to the Mailchimp and end it
    request.write(jsonData);
    request.end();
});