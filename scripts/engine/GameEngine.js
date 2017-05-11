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
GameEngine._StartGame = false;

/** Init: starts loading objects */
GameEngine.init = function () {
  PhysicsEngine.init();

  let sceneFile = 'assets/scenes/mainScene.json';
  let meshFiles = ['assets/scenes/Primatives.json','assets/scenes/teapots.json', 'assets/scenes/ExampleLevel.json',
    'assets/meshes/Altar.1.json',
    'assets/meshes/Altar.2.json',
    'assets/meshes/Ceiling.1.json',
    'assets/meshes/Ceiling.2.json',
    'assets/meshes/Door.1.json',
    'assets/meshes/DoorFrame.1.json',
    'assets/meshes/DoorFrame.2.json',
    'assets/meshes/FloorTiles.1.json',
    'assets/meshes/FloorTiles.2.json',
    'assets/meshes/FloorTiles.3.json',
    'assets/meshes/Ground_tiled.1.json',
    'assets/meshes/Pillar_round.1.json',
    'assets/meshes/Pillar_round.2.json',
    'assets/meshes/Pillar_round.3.json',
    'assets/meshes/Pillar_square.1.json',
    'assets/meshes/Pillar_square.2.json',
    'assets/meshes/Railing.1.json',
    'assets/meshes/Rock.1.json',
    'assets/meshes/Rock.2.json',
    'assets/meshes/Rock.3.json',
    'assets/meshes/Rock.4.json',
    'assets/meshes/Statue.1.json',
    'assets/meshes/Statue.2.json',
    'assets/meshes/Step.1.json',
    'assets/meshes/Wall_ornate.1.json',
    'assets/meshes/Wall_ornate.2.json',
    'assets/meshes/Wall_rock.1.json',
    'assets/meshes/Wall_rock.2.json',];
  GameEngine.currentScene = new GameScene(sceneFile, meshFiles);
};

GameEngine.ready= function () {

    document.getElementById("progress").style.visibility="hidden";
    GameEngine.start();

};

/** Start: setup everything after loading is complete, then start loop */
GameEngine.start = function () {
    GameEngine._started = true;
    GameEngine.currentScene.start();

    if (!IS_SERVER) {
      Renderer.start();
      Debug.start();
      window.requestAnimationFrame(GameEngine.loop.bind(GameEngine));
    }
  };

GameEngine.startMethod = GameEngine.ready;

/** Loop: called every frame */
GameEngine.loop = function () {
  Time.tick();
  Input.update();

  // send data
  if (!Debug.clientUpdate){
    Networking.update();
  }

  GameEngine.currentScene.update();

  if (Debug.clientUpdate) {
    GameObject.prototype.SceneRoot.update();
  }

  GameObject.prototype.SceneRoot.updateClient();

  if (!IS_SERVER) {
    Renderer.loop();
    Debug.update();
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
    let loadBar = document.getElementById("progressBar");
    let progress = (GameEngine._numLoads-GameEngine._loadHandles.length)/GameEngine._numLoads;
    progress=Math.round(progress*100);
    loadBar.setAttribute("style","width: "+progress+"%");
    //set Text
    let loadText = document.getElementById("progressBarText");
    loadText.innerText = 'Loading Progress: (' +
        (GameEngine._numLoads - GameEngine._loadHandles.length) + ' / ' + GameEngine._numLoads + ')';
};


