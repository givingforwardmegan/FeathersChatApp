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


  var populateMessagesOnPageLoad = async () => {
    var messages = null;
    var length = null;
    var html = ``;
    var message = null;

    var messages = await messagesService.find({
      query: {
        $sort: {
          createdAt: 1
        }
      }
    });

    messages = messages.data;
    length = messages.length;

    for (var i = 0; i < length; i++) {
      message = messages[i];
      html += new Message(message.text, message._id, message.userId).getMessageHtmlString();
    }

    $('#chat-message-area').append(html);   //append to DOM
  };


  /* Messages class - handle all messages */
  class Message {
    constructor(msgText, msgId, msgUserId = null) {
      this.msgText = msgText;
      this.msgUserId = msgUserId;
      this.msgId = msgId;
    }

    getMessageHtmlString() {
      var deleteIconHtml = ``;

      if (this.msgUserId === client.get('userId')) {
        deleteIconHtml = `
        <div class="pull-right">
        <span class="delete-message" title="Delete Message?">
          <i class="fa fa-times" aria-hidden="true"></i>
        </span>
      </div>
        `;
      }

      var msgHtmlString = `
            <div class="media" data-id="${this.msgId}">
            <div class="media-left">
              <a href="#">
                <img src="./images/icon.png" alt="64x64 user profile image" class="media-object" style="width: 64px; height: 64px;">
              </a>
            </div>
            <div class="media-body">
              ${deleteIconHtml}
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

      return client.passport.verifyJWT(response.accessToken); //decode JWT to get ID

    }).then((payload) => {
      const { userId } = payload;
      client.set('userId', userId); //add userId property to client
      main();
    }).catch((err) => {
      //client not authenticated, redirect to login
      console.log(err);
      window.location.href = `${serverURL}/login.html`;

    }); //end authenticate


  /* Run all page load scripts after authentication is completed */
  function main() {
    populateMessagesOnPageLoad();

    //watch for a removed event, when found remove message from DOM
    messagesService.on('removed', (message) => {
      //console.log(message);
      var msgId = message._id;

      $(`.media[data-id="${msgId}"]`).remove();

    });

    $('#chat-message-area').on('click', '.delete-message', function () {

      var msgId = $(this).closest('.media').attr('data-id');
      messagesService.remove(msgId);

    });



    $('#logout-icon').on('click', function () {
      client.logout();
      window.location.href = `${serverURL}/login.html`;
    });


    /* create new message */
    $('#submit-message-form').submit(function (e) {
      e.preventDefault();

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
      var msgUserId = message.userId;
      var msgId = message._id;
      var newMessage = new Message(msgText, msgId, msgUserId);

      //console.log(newMessage.getMessageHtmlString());
      $('#chat-message-area').append(newMessage.getMessageHtmlString());

      //animate the user window down when new message are added
      $('html, body').animate({
        scrollTop: $(document).height()
      }, "slow");

    });
  } //end main()

});
