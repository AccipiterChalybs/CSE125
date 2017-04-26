'use strict';
let Networking = {};

Networking.registerListeners = function (socket, listeners) {
  // let socket = this;
  for (let method in listeners) {
    console.log(`ADDING HANDLER: ${method}`);

    ((realMethod) => {
      socket.on(realMethod, (data) => {
       // console.log(`RECEIVED ${realMethod}`);
        listeners[realMethod](socket, data);
      });
    })(method);
  }
};

Networking.createClientSocket = function (namespace) {
  let url = location.href; // "http://162.243.136.237:3000/
  return io(url + namespace);
};

Networking.listeners = {
  client_updated_scene: (socket, data)=> {
    GameObject.prototype.SceneRoot.applySerializedData(data.transformTree);
  },
};

Networking.init = function () {
  Networking.socket = Networking.createClientSocket('hello');
  Networking.registerListeners(Networking.socket, Networking.listeners);
};

Networking.update = function () {
  let data = {};
  data.horizontal = Input.getAxis('horizontal');
  data.vertical = Input.getAxis('vertical');
  Networking.socket.emit('server_input_data', data);
};

