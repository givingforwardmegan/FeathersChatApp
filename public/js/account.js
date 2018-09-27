$(document).ready(function () {
  var serverURL = "http://localhost:3030";

  /* feathers boilerplate to connec to users service */
  var socket = io(serverURL);

  //initialize feathers client application through socket.io
  var client = feathers();
  client.configure(feathers.socketio(socket));

  //tell it where to store the jwt for auth - local storage
  client.configure(
    feathers.authentication({
      storage: window.localStorage
    })
  );

  //obtain services
  var usersService = client.service("/users");
  var messagesService = client.service("/messages");

  /* get user credentials */

  function getCredentials() {
    var user = {
      email: $("#user-email").val(),
      password: $("#user-password").val(),
      username: $('#username').val()
    };

    return user;
  }

  /* handle form submission */
  $("#new-user-form").submit(function (e) {
    e.preventDefault();

    var userCredentials = getCredentials();

    //create a new user using the feathers client
    usersService.create(userCredentials)
      .then(res => {
        console.log(res);
        //if promise successful, redirect to login page
        window.location.href = `${serverURL}/login.html`;
      })
      .catch(err => {
        console.log(err);
        $("#error-message")
          .text(`There was an error creating your account ${err}.`)
          .show();
      });
  });
});
