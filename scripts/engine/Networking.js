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

  client_get_playerId: (socket, data)=> {
    console.log('network listen client_get_playerId');
    PlayerTable.currentPlayer = data.playerId;
  },

  client_init: (socket, data) => {
    console.log('network listen client_init');
    Networking.socket.emit('request_playerId', { id: PlayerTable.requestId });
  },

  client_get_new_scene: (socket, data)=> {
    Debug.log('Baby got back');
    GameEngine.sceneFile = data.s;
    GameEngine.restart();
  },
};

Networking.serverListener = {

  client_updated_scene: (socket, data)=> {
    // console.log(data.transformTree.c[1].c[58].p);
    //GameObject.prototype.SceneRoot.applySerializedData(data.transformTree);
    // Debug.log(data.gameObjectTree[36]);

    if(GameEngine._started && !Debug.clientUpdate) {
      for (let key in data.gameObjectTree) {
        let gameobject = GameObject.prototype.SerializeMap[key];
        if (gameobject && gameobject !== null) {
          gameobject.transform.applySerializedData(data.gameObjectTree[key]['Transform']);
          gameobject.applySerializedData(data.gameObjectTree[key]);
        }
      }
      // Debug.log(Date.now()-t);
    }

  },
  client_get_playerId: (socket, data)=> {
    console.log('network listen client_get_playerId');
    PlayerTable.currentPlayer = data.playerId;
  },
  //TODO HELP HELP
  //don't know what to do here - accept both I think?
  client_init: (socket, data) => {
    console.log('network listen client_init');
    Networking.socket.emit('request_playerId', { id: PlayerTable.requestId });
  },

  client_get_new_scene:(socket,data)=>{
    Debug.log("Baby got back");
    GameEngine.sceneFile = data.s;
    Debug.clientUpdate = data.c;
    GameEngine.restart();
  }
};

Networking.init = function () {
  Networking.socket = Networking.createClientSocket('hello');
  Networking.registerListeners(Networking.socket, Networking.listeners);
};

Networking.update = function () {
  if (GameEngine._started) {

    let data = {};
    data.h = Input.getAxis('horizontal');
    data.v = Input.getAxis('vertical');
    data.f = Renderer.camera.transform.getForward();
    data.c = Renderer.camera.transform.getWorldPosition();
    data.s = Input.getAxis('sing');
    data.w = Input.getAxis('walk');
    data.a = Input.getAxis('action');
    Networking.socket.emit('server_input_data', data);
  }
};

Networking.informWin = function (sceneName) {
  let data = {sceneName: sceneName};
  Networking.socket.emit('win', data);
};

