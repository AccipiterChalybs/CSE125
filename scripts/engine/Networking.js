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
    // console.log(data.transformTree.c[1].c[58].p);
    GameObject.prototype.SceneRoot.applySerializedData(data.transformTree);
  },
  client_get_playerId: (socket, data)=> {
    PlayerTable.currentPlayer = data.playerId;
  },
};

Networking.init = function () {
  Networking.socket = Networking.createClientSocket('hello');
  Networking.registerListeners(Networking.socket, Networking.listeners);
};

Networking.update = function () {
  let data = {};
  data.h = Input.getAxis('horizontal');
  data.v = Input.getAxis('vertical');
  data.f = Renderer.camera.transform.getForward();
  Networking.socket.emit('server_input_data', data);
};

