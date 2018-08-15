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


  /* Messages class - handle all messages */
  class Message {
    constructor(msgText) {
      this.msgText = msgText;
    }

    getMessageHtmlString() {
      var msgHtmlString = `
            <div class="media">
            <div class="media-left">
              <a href="#">
                <img src="./images/icon.png" alt="64x64 user profile image" class="media-object" style="width: 64px; height: 64px;">
              </a>
            </div>
            <div class="media-body">
              <div class="pull-right">
                <span class="delete-comment" title="Delete Comment?">
                  <i class="fa fa-times" aria-hidden="true"></i>
                </span>
              </div>
              <h4 class="media-heading">Megan Cole</h4>
              <span class="comment-date">08-02-2018 9:00 AM</span>
              <br/><br/>
              ${this.msgText}
            </div>
          </div>
        `;

      return msgHtmlString;
    }


  } //end message class



  //if user is authenticated, run page code; otherwise redirect to login
  client.authenticate()
    .then((response) => {
      //client is authenticated

      $('#logout-icon').on('click', function () {
        client.logout();
        window.location.href = `${serverURL}/login.html`;
      });


      /* create new message */
      $('#submit-message-form').submit(function (e) {
        e.preventDefault;

        var $msgText = $('#msg-text');
        var msgText = $msgText.val();
        $msgText.val('');

        //if message text contains more than whitespace, save message to database
        if (msgText.trim().length) {
          messagesService.create({
            text: msgText
          }).catch((err) => {
            alert(`There was an error submitting your message.`);
          });
        }
      });

      /* Watch for, and handle, message events */
      messagesService.on('created', (message) => {
        var msgText = message.text;
        var newMessage = new Message(msgText);

        console.log(newMessage.getMessageHtmlString());
        $('#chat-message-area').append(newMessage.getMessageHtmlString());

      });

    }).catch((err) => {
      //client not authenticated, redirect to login
      console.log(err);
      window.location.href = `${serverURL}/login.html`;
    });



});
