'use strict';
let Networking = {};

Networking.registerListeners = function (socket, listeners) {
  // let socket = this;
  for (let method in listeners) {
    console.log(`ADDING HANDLER: ${method}`);

    ((realMethod) => {
      socket.on(realMethod, (data) => {
        console.log(`RECEIVED ${realMethod}`);
        listeners[realMethod](socket, data);
      });
    })(method);
  }
};

Networing.createClientSocket = function (namespace) {
  return io('http://localhost:3000'+namespace);
};

Networing.listeners = {
  send_updated_scene: (socket, data)=> {
    console.log(data);
  },
};

Networking.init = function() {
  Networking.socket = Networking.createClientSocket('/hello');
  Networking.registerListeners(Networking.socket,Networking.listeners);

};

Networking.update = function () {
  let data ={};
  data.horizontal = Input.getAxis("horizontal");
  data.vertical = Input.getAxis("vertical");
  Networking.socket.emit("get_input_data",data);
};






