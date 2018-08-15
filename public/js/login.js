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
      email: $("#login-email").val(),
      password: $("#login-password").val()
    };

    return user;
  }


  $('#login-user-form').submit(function (e) {
    e.preventDefault();

    var userCredentials = getCredentials();

    //use the feathers client to authenticate
    client.authenticate({
      strategy: 'local',
      email: userCredentials.email,
      password: userCredentials.password
    }).then((token) => {
      //if successful redirect to the chat application
      window.location.href = serverURL;
      //if unsuccessful, provide error message to user
    }).catch((err) => {
      console.log(err);
      $('#error-message')
        .text(`Error logging in: ${err.message}.`)
        .show();
    });
  });



});
