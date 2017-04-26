/**
 * Created by Accipiter Chalybs on 4/13/2017.
 */

let GameEngine = {};

GameEngine.loadingTextId = 'loadProgress';
GameEngine._ready = false;      //if true, all requests have been made, and can start when they finish
GameEngine._started = false;    //don't restart if we happen to load something at runtime;
GameEngine._numLoads = 0;         //total number of loads (for UI)
GameEngine._loadHandles = [];   //handles of currently loading objects
GameEngine._nextLoadHandle = 0; //next load handle to return
GameEngine.currentScene = null;


/** Init: starts loading objects */
GameEngine.init = function () {
    //['assets/scenes/teapots.json']
    //['assets/scenes/Scene1.json']
  PhysicsEngine.init();

  GameEngine.currentScene = new GameScene(['assets/scenes/teapots.json', 'assets/scenes/ExampleLevel.json']); //['assets/scenes/teapots.json']

};


/** Start: setup everything after loading is complete, then start loop */
GameEngine.start = function () {
    GameEngine._started = true;
    GameEngine.currentScene.start();

    if (!IS_SERVER) {
      Renderer.start();
      window.requestAnimationFrame(GameEngine.loop.bind(GameEngine));
    }
  };

GameEngine.startMethod = GameEngine.start;

/** Loop: called every frame */
GameEngine.loop = function () {
  Time.tick();
  Input.update();

  // send data
  Networking.update();
  GameEngine.currentScene.update();

  if (Debug.clientUpdate) {
    GameObject.prototype.SceneRoot.update();
  }

  GameObject.prototype.SceneRoot.updateClient();

  if (!IS_SERVER) {
    Renderer.loop();
    window.requestAnimationFrame(GameEngine.loop.bind(GameEngine));
  }
};

/** Signal that no more requests are likely to be made (and so can start after all current tasks are loaded */
GameEngine.finishLoadRequests = function () {
    GameEngine._ready = true;
    if (GameEngine._loadHandles.length === 0 && !GameEngine._started) {
      GameEngine.startMethod();
    }
  };

/** Register that we are loading an object & should not start until it's completed
 * @returns {number} A handle that should be passed to completeLoading() to indicate this specific load has finished
 */
GameEngine.registerLoading = function () {
  let loadHandle = GameEngine._nextLoadHandle;
  GameEngine._nextLoadHandle++;
  GameEngine._numLoads++;

  if (GameEngine._started) { console.log('Loaded something at runtime after load, was this supposed to happen?'); }

  GameEngine._loadHandles.push(loadHandle);
  if (!IS_SERVER) GameEngine.updateLoadingBar();
  return loadHandle;
};

/** Signal that a load was complete */
GameEngine.completeLoading = function (loadHandle) {
  let index = GameEngine._loadHandles.indexOf(loadHandle);
  if (index > -1) {
    GameEngine._loadHandles.splice(index, 1);
    if (!IS_SERVER) GameEngine.updateLoadingBar();
    if (GameEngine._loadHandles.length === 0 && GameEngine._ready && !GameEngine._started) {
      GameEngine.startMethod();
    }
  } else {
    console.error('Trying to complete load on already loaded object: ' + loadHandle);
  }
};

/** Updates the UI with current loading status */
GameEngine.updateLoadingBar = function () {
  let loadText = document.getElementById(GameEngine.loadingTextId);
  loadText.innerText = 'Loading Progress: (' +
      (GameEngine._numLoads - GameEngine._loadHandles.length) + ' / ' + GameEngine._numLoads + ')';
};
