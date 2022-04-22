module.exports = function() {
  /**
   * available streams 
   * the id value is considered unique (provided by socket.io)
   */
  var streamList = [];

  /**
   * Stream object
   */
  var Stream = function(userId, id, name) {
    this.userId = userId;
    this.name = name;
    this.id = id;
  }

  return {
    addStream: function (userId, id, name) {
      var stream = new Stream(userId, id, name);
      streamList.push(stream);
    },

    removeStream : function(id) {
      var index = 0;
      while(index < streamList.length && streamList[index].id != id){
        index++;
      }
      streamList.splice(index, 1);
    },

    // update function
    update: function (userId, id, name) {
      var stream = streamList.find(function(element, i, array) {
        return element.id == id;
      });

    //console.log('Updated: ' + stream.name + ' UserId: ' + stream.userId + ' socketId: ' + stream.id + ' to update --');

      stream.id = id;
      stream.userId = userId;
      stream.name = name;
    },

    getStream: function (userId) {
      return streamList.find(function (element, i, array) {
        return element.userId == userId;
      });
    },

    getStreamById: function (id) {
      return streamList.find(function (element, i, array) {
        return element.id == id;
      });
    },

    getStreams : function() {
      return streamList;
    }
  }
};
