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
GameEngine.sceneFile = 'assets/scenes/level0.json';

/** Init: starts loading objects */
GameEngine.init = function () {
  PhysicsEngine.init();

  let meshFiles = ['assets/scenes/Primatives.json','assets/scenes/teapots.json', 'assets/scenes/ExampleLevel.json',
    "assets/meshes/Altar.1.json",
    "assets/meshes/Altar.2.json",
    "assets/meshes/AxisTest.json",
    "assets/meshes/Barrel.1.json",
    "assets/meshes/Block.Large.1.json",
    "assets/meshes/Block.Large.2.json",
    "assets/meshes/Block.Small.1.json",
    "assets/meshes/Block.Small.2.json",
    'assets/meshes/BlueRobeMale.json',
    "assets/meshes/Cage.1.json",
    "assets/meshes/Ceiling.1.json",
    "assets/meshes/Ceiling.2.json",
    "assets/meshes/Ceiling.3.json",
    "assets/meshes/Ceiling.large.1.json",
    "assets/meshes/Ceiling.large.2.json",
    "assets/meshes/Chain.1.json",
    "assets/meshes/Chair.1.json",
    "assets/meshes/Chair.2.json",
    "assets/meshes/Crate.1.json",
    "assets/meshes/Crate.2.json",
    "assets/meshes/Crate.3.json",
    "assets/meshes/Door.1.json",
    "assets/meshes/Door.2.json",
    "assets/meshes/DoorFrame.1.json",
    "assets/meshes/DoorFrame.2.json",
    "assets/meshes/DoorFrame.3.json",
    "assets/meshes/DoorFrame.4.json",
    "assets/meshes/FloorTiles.1.json",
    "assets/meshes/FloorTiles.2.json",
    "assets/meshes/FloorTiles.3.json",
    "assets/meshes/Ground_tiled.1.json",
    "assets/meshes/Intro1.json",
    "assets/meshes/Intro2.json",
    "assets/meshes/IntroHypeRoom.json",
    "assets/meshes/Ivy.1.json",
    "assets/meshes/LillyPad.1.json",
    "assets/meshes/navmesh.json",
    "assets/meshes/octo_idle.json",
    "assets/meshes/octo_run.json",
    "assets/meshes/octo_walking.json",
    "assets/meshes/Pebble.1.json",
    "assets/meshes/Pebble.2.json",
    "assets/meshes/Pebble.3.json",
    "assets/meshes/Pillar.Rocky.1.json",
    "assets/meshes/Pillar.Rocky.2.json",
    "assets/meshes/Pillar_round.1.json",
    "assets/meshes/Pillar_round.2.json",
    "assets/meshes/Pillar_round.3.json",
    "assets/meshes/Pillar_square.1.json",
    "assets/meshes/Pillar_square.2.json",
    "assets/meshes/Plant.1.json",
    "assets/meshes/Plant.2.json",
    "assets/meshes/Plant.3.json",
    "assets/meshes/Pot.1.json",
    "assets/meshes/Pot.2.json",
    "assets/meshes/Pot.3.json",
    "assets/meshes/Pot.4.json",
    "assets/meshes/Railing.1.json",/*
    "assets/meshes/red_left_cover_sneak.json",
    "assets/meshes/red_left_turn_90.json",
    "assets/meshes/red_looking_behind.json",
    "assets/meshes/red_right_cover_sneak.json",
    "assets/meshes/red_right_turn_90.json",
    "assets/meshes/red_running_slide.json",
    "assets/meshes/red_running_turn_180.json", */
    "assets/meshes/RedRobedFemale_idle.json",
    "assets/meshes/RedRobedFemale_run.json",
    "assets/meshes/RedRobedFemale_walk.json",
    "assets/meshes/Rock.1.json",
    "assets/meshes/Rock.2.json",
    "assets/meshes/Rock.3.json",
    "assets/meshes/Rock.4.json",
    "assets/meshes/Roots.1.json",
    "assets/meshes/Roots.2.json",
    "assets/meshes/Roots.3.json",
    "assets/meshes/senate_idle.json",
    "assets/meshes/senate_jump.json",
    "assets/meshes/senate_left_strafe.json",
    "assets/meshes/senate_left_turn_90.json",
    "assets/meshes/senate_right_strafe.json",
    "assets/meshes/senate_right_turn_90.json",
    "assets/meshes/senate_run.json",
    "assets/meshes/senate_walking.json",
    "assets/meshes/SetPiece1.json",
    "assets/meshes/SetPiece1_Ceiling.json",
    "assets/meshes/SetPiece1_Ground.json",
    "assets/meshes/SetPiece1_Pillars.json",
    "assets/meshes/SetPiece1_Sculptures.json",
    "assets/meshes/Skeleton.1.json",
    "assets/meshes/Skeleton.2.json",
    "assets/meshes/spike.1.json",
    "assets/meshes/Stair.Rocky.1.json",
    "assets/meshes/Stalactite.1.json",
    "assets/meshes/Stalactite.2.json",
    "assets/meshes/Statue.1.json",
    "assets/meshes/Statue.2.json",
    "assets/meshes/Statue.3.json",
    "assets/meshes/Step.1.json",
    "assets/meshes/sungod.json",
    "assets/meshes/Table.1.json",
    "assets/meshes/Table.2.json",
    "assets/meshes/Table.3.json",
    "assets/meshes/TempleEntryTunnel.json",
    "assets/meshes/TempleSecondLevelCeiling.json",
    "assets/meshes/TempleTop.json",
    "assets/meshes/TempleTop_roof.json",
    "assets/meshes/TempleTopLevelCeiling.json",
    "assets/meshes/TempleValley.json",
    "assets/meshes/Torch.1.json",
    "assets/meshes/Tree.1.json",
    "assets/meshes/Tree.2.json",
    "assets/meshes/Tree1.json",
    "assets/meshes/Tree2.json",
    "assets/meshes/tree2_leaves.json",
    "assets/meshes/tree2_trunk.json",
    "assets/meshes/Tree3.json",
 /*   "assets/meshes/Tribal_left_cover_sneak.json",
    "assets/meshes/Tribal_left_turn_90.json",
    "assets/meshes/Tribal_looking_behind.json",
    "assets/meshes/Tribal_right_cover_sneak.json",
    "assets/meshes/Tribal_right_turn_90.json",
    "assets/meshes/Tribal_running_slide.json",
    "assets/meshes/TribalCharacter_idle.json",
    "assets/meshes/TribalCharacter_run.json",*/
    "assets/meshes/TribalCharacter_walk.json",
    "assets/meshes/unitCube.json",
    "assets/meshes/Vine.1.json",
    "assets/meshes/Vine.2.json",
    "assets/meshes/Vine.3.json",
    "assets/meshes/Vine.4.json",
  //  "assets/meshes/walking.json",
    "assets/meshes/Wall.Ruin.1.json",
    "assets/meshes/Wall.Ruin.2.json",
    "assets/meshes/Wall.Ruin.3.json",
    "assets/meshes/Wall.Ruin.4.json",
    "assets/meshes/Wall.Ruin.5.json",
    "assets/meshes/Wall.Ruin.6.json",
    "assets/meshes/Wall.Ruin.7.json",
    "assets/meshes/Wall_ornate.1.json",
    "assets/meshes/Wall_ornate.2.json",
    "assets/meshes/Wall_ornate.3.json",
    "assets/meshes/Wall_ornate.4.json",
    "assets/meshes/Wall_rock.1.json",
    "assets/meshes/Wall_rock.2.json",
    "assets/meshes/Wall_rock.3.json",
    "assets/meshes/Wall_simple.1.json"
  ];
  let animationFiles = {
    'OctopusCharacterAnim' : {
      metaData: {root: "metarig", rootAxisLocked: [true, true, false]},
      info: [
        ['assets/meshes/octo_idle.json', [0, 1]],
        ['assets/meshes/octo_walking.json', [1]],
        ['assets/meshes/octo_run.json', [1]]
      ]
    },
    'RedRobesCharacterAnim' : {
      metaData: {root: "hips", rootAxisLocked: [true, false, true]},
      info: [
        ['assets/meshes/RedRobedFemale_idle.json' , [0]],
        ['assets/meshes/RedRobedFemale_idle.json' , [0]],
        ['assets/meshes/RedRobedFemale_walk.json' , [0]],
        ['assets/meshes/RedRobedFemale_run.json'  , [0]]
      ]
    },
    'TribalCharacterAnim' : {
      metaData: {root: "root", rootAxisLocked: [true, false, true]},
      info: [
        ['assets/meshes/TribalCharacter_idle.json' , [0]],
        ['assets/meshes/TribalCharacter_idle.json' , [0]],
        ['assets/meshes/TribalCharacter_walk.json' , [0]],
        ['assets/meshes/TribalCharacter_walk.json' , [0]]
      ]
    },
    'SenateCharacterAnim' : {
      metaData: {root: "hips", rootAxisLocked: [true, false, true]},
      info: [
        ['assets/meshes/senate_idle.json' , [0]],
        ['assets/meshes/senate_idle.json' , [0]],
        ['assets/meshes/senate_walking.json' , [0]],
        ['assets/meshes/senate_walking.json' , [0]]
      ]
    }
  };
  GameEngine.currentScene = new GameScene(GameEngine.sceneFile, meshFiles, animationFiles);
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
  if(GameEngine._started) {
    if (!IS_SERVER) {
      Debug.Profiler.newFrame();
      Debug.Profiler.startTimer("UpdateLoop", 1);
    }
    Time.tick();
    Input.update();

    // send data

    if (!Debug.clientUpdate) {
      Networking.update();
    }
    GameEngine.currentScene.update();

    if (Debug.clientUpdate) {
      GameObject.prototype.SceneRoot.update();
    }

    GameObject.prototype.SceneRoot.updateClient();



    if (!IS_SERVER) {
      Debug.Profiler.endTimer("UpdateLoop", 1);
      Debug.Profiler.startTimer("RenderTime", 1);
      Renderer.loop();
      Debug.Profiler.endTimer("RenderTime", 1);
      Debug.update();
      //window.setTimeout(GameEngine.loop.bind(GameEngine), 5);
      window.requestAnimationFrame(GameEngine.loop.bind(GameEngine));
    }
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

GameEngine.stop = function (){
  GameEngine._ready = false;      //if true, all requests have been made, and can start when they finish
  GameEngine._started = false;    //don't restart if we happen to load something at runtime;

  GameObject.prototype._nameMap = {};
  GameObject.prototype.SceneRoot = null;
  GameObject.prototype.SerializeMap = {};
  GameObject.prototype.objectId = 25000;
  // GL.clearColor(1.0, 1.0, 1.0, 1.0)
  // GL.clear(GL.COLOR_BUFFER_BIT)
  Debug.Profiler.data = [];
  Debug.Profiler.map = {};
  Debug.Profiler.index = 0;

  PlayerTable.players = [];
  PlayerTable.hate=[];

  if(!IS_SERVER){
    Howler.unload();
  }
}

GameEngine.restart = function () {

  GameEngine.stop();
  let glCanvas = null;
  if(!IS_SERVER) {
    glCanvas = document.getElementsByTagName('canvas')[0];
    if (Debug.bufferDebugMode) {
      GL = glCanvas.getContext('webgl2', {antialias: false});
    } else {
      GL = glCanvas.getContext('webgl2');
    }
    Input.init();
    AudioEngine.init();


  }

  //glCanvas.getContext("webgl") || glCanvas.getContext("experimental-webgl");

  GameEngine.init();
  if(!IS_SERVER) {

    if(!Debug.clientUpdate){
      Networking.registerListeners(Networking.socket, Networking.serverListener);
    }

    if(glCanvas && glCanvas!==null) initRenderer(glCanvas);
  }
}


