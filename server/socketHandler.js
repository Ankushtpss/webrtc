module.exports = function (io, streams, pingInterval, push) {

  io.on('connection', function (client) {
    console.log('New connection with: ' + client.id);

    io.sockets.emit('updateClient', client.id);

    client.on('OnUpdateClient', function (options) {
     var user = streams.getStream(options.userId);
     if (user != null) {

       console.log('User exist : ' + user.name + ' UserId: ' + user.userId + ' socketId: ' + user.id + ' to update --');
       streams.update(options.userId, client.id, options.name);


     } else {

       console.log('Added new user: ' + options.name + ' UserId: ' + options.userId + ' socketId: ' + client.id + ' to update --');
       streams.addStream(options.userId, client.id, options.name);
     }

      var data = {
        userId: options.userId,
        userStatus: true,
        lastOnline: Date.now()
      };

      io.sockets.emit('onUserStatusChanged', data);
    });

    /*****************************************************************************************************************************************
     ********************************************* Utilities  *****************************************************************
     *****************************************************************************************************************************************/

    client.on('socket_pong', function (data) {
      console.log("Pong received from client: " + data.name);

      var user = streams.getStreamById(client.id);
      if (user != null) {
        streams.update(data.userId, client.id, data.name);
      } else {
        streams.addStream(data.userId, client.id, data.name);
      }

      var userDate = {
        userId: data.userId,
        userStatus: true,
        lastOnline: Date.now()
      };

      io.sockets.emit('onUserStatusChanged', userDate);

    });

    setTimeout(sendHeartbeat, pingInterval); // To disable if problems.

    function sendHeartbeat() {

      setTimeout(sendHeartbeat, pingInterval);

      io.sockets.emit('socket_ping', {
        beat: 1
      });
    }

    // Online Status
    client.on('isActive', function (User) {

      var user = streams.getStream(User.userId);

      if (user) {
        const response = io.sockets.connected[user.id];

        if (response) {

          var data = {
            userId: User.userId,
            userStatus: true,
            lastOnline: Date.now()
          };

          console.log(user.userId + ' ( ' + user.name + ' ) ' + 'is online ');
          io.sockets.emit('onUserStatusChanged', data);

        } else {

          var data = {
            userId: User.userId,
            userStatus: false,
            lastOnline: Date.now()
          };

          console.log(user.userId + ' ( ' + user.name + ' ) ' + 'is offline ');
          io.sockets.emit('onUserStatusChanged', data);

        }

      } else {
        console.log('isActive user does not exist');

        var data = {
          userId: User.userId,
          userStatus: false,
          lastOnline: Date.now()
        };
        client.emit('onUserStatusChanged', data);

      }

    });

    client.on('onConnect', function (options) {
      console.log('Name: ' + options.name + ' UserId: ' + options.userId + ' socketId: ' + client.id + ' is connected');

      var user = streams.getStream(options.userId);
      if (user != null) {

        console.log('User exist : ' + user.name + ' UserId: ' + user.userId + ' socketId: ' + user.id + ' to update --');
        
      } else {

        console.log('Added new user: ' + options.name + ' UserId: ' + options.userId + ' socketId: ' + client.id + ' to update --');
        streams.addStream(options.userId, client.id, options.name);
      }

      var data = {
        userId: options.userId,
        userStatus: true,
        lastOnline: Date.now()
      };

      io.sockets.emit('onUserStatusChanged', data);

    });

    client.on('disconnect', function () {
      console.log("User disconnected");
     var usersArray = streams.getStreams();
      if (usersArray.length != 0) {
        for (var i = 0; i < usersArray.length; i++) {
          var user = usersArray[i];
          if (user != null) {

            if (user.id == client.id) {

              console.log(user.userId + ' ( ' + user.name + ' ) ' + 'is offline ');

              var data = {
                userId: user.userId,
                userStatus: false,
                lastOnline: Date.now()
              };

              io.sockets.emit('onUserStatusChanged', data);

              streams.removeStream(client.id);

              console.log("Users new size " + usersArray.length);

              break;
            } else {
              streams.removeStream(client.id);
            }

          } else {
            console.log("The user is null to disconnect ");
          }


        }
      } else {

          streams.removeStream(client.id);

        }
    });

    /*****************************************************************************************************************************************
     ********************************************* AddCall  *****************************************************************
     *****************************************************************************************************************************************/

    client.on('onCall', function (options) {

      client.emit('id', client.id);
     
      console.log('-- ' + client.id + ' is ready to stream --');

    });

    client.on('message', function (details) {
      var otherClient = io.sockets.connected[details.to];

      if (!otherClient) {
        return;
      }
      delete details.to;
      details.from = client.id;
      otherClient.emit('message', details);
    });

    client.on('readyToStream', function (options) {
     
      console.log('-- Name: ' + options.name + ' UserId: ' + options.userId + ' socketId: ' + client.id + ' is ready to stream --');

      var user = streams.getStream(options.userId);
      if (user != null) {

        console.log('User exist : ' + user.name + ' UserId: ' + user.userId + ' socketId: ' + user.id + ' to update --');
        streams.update(options.userId, client.id, options.name);


      } else {

        console.log('Added new user: ' + options.name + ' UserId: ' + options.userId + ' socketId: ' + client.id + ' to update --');
        streams.addStream(options.userId, client.id, options.name);
      }

    });

    // Make New call
    client.on('makeNewCall', function (data) {

      console.log('New call from: ' + data.callerId + ' to: ' + data.receiverId + ' is ready to call');
      client.broadcast.emit('onNewCall', data);

    });

    // hangUp the call
    client.on('hangUpNewCall', function (data) {

      console.log('HangUp new call from: ' + data.callerId + ' to: ' + data.receiverId + ' is ready to hangUp');
      client.broadcast.emit('finishCall', data);

    });

    // reject incoming call
    client.on('onNewCallRejected', function (data) {

      console.log('Reject new call from: ' + data.receiverId + ' to: ' + data.callerId + ' is ready to reject');
      client.broadcast.emit('rejectCall', data);

    });

    // alert call is ringing
    client.on('callIsRinging', function (data) {

      console.log('Alert that new call from: ' + data.receiverId + ' to: ' + data.callerId + ' is ringing');
      client.broadcast.emit('onCallRing', data);

    });

    // HangUp current Cal
    client.on('hangUpCall', function (data) {

      console.log('HangUp current call from: ' + data.receiverId + ' to: ' + data.callerId + ' is made');
      client.broadcast.emit('onHangUpCall', data);

    });

     /*****************************************************************************************************************************************
      ********************************************* Push notifications  *****************************************************************
      *****************************************************************************************************************************************/

      client.on('on_missed_call_push', function (dataPush) {

        console.log('Sending Missed Call to ID : ' + dataPush.senderId + ' from : ' + dataPush.callerFullName);

        var data = {
          title: 'Missed Call',
          body: dataPush.callerFullName,
          sound: undefined,
          icon: undefined,
          msgcnt: undefined,
          custom: {
            senderId: dataPush.senderId,
            receiverId: dataPush.receiverId,
            pushType: "CALL",
          },
          priority: 'high',
        };

       sendPush(push, data, dataPush.deviceToken);

      });

      function sendPush(push, data, toDeviceToken) {

        push.send(toDeviceToken, data, (err, result) => {
          if (err) {
            console.log(err);
          } else {
            console.log(result);
          }
        });

      }

  });
};