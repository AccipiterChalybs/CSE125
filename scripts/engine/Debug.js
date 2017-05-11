/**
 * Created by Accipiter Chalybs on 4/13/2017.
 */

let Debug = {};

Debug.clientUpdate = false; //Run the client in standalone mode, so it doesn't need a server - good for testing!
Debug.bufferDebugMode = true; //Sets the OpenGL Context to not use MSAA, so that buffers can be blitted to the screen
Debug.debugDisplay = true;
Debug.quickLoad = false;
Debug.autoStart = false;

Debug.tmp_shadowTwoSideRender = true; //Var to remind me to remove this when we get in new level geometry

Debug.start = function() {
  if (Debug.debugDisplay) {
    if (Debug.fpsElement === null) Debug.fpsElement = document.getElementById("fpsLog");
    if (Debug.exposureElement === null) Debug.exposureElement = document.getElementById("exposureLog");
  }
};

Debug.update = function() {
  if (Input.getAxis("debugButton_Menu")) {
    Debug.displayOpen = !Debug.displayOpen;
    document.getElementById("debugContainer").style.display = (Debug.displayOpen) ? "block" : "none";
  }

  if (Debug.displayOpen) {
    Debug.logFPS();
    Debug.logExposure();
  }

  if (Debug.bufferDebugMode) {
    if (Input.getAxis("debugButton_Buffer1")) {
      Debug.currentBuffer = Debug.BUFFERTYPE_NONE;
    }
    if (Input.getAxis("debugButton_Buffer2")) {
      Debug.currentBuffer = Debug.BUFFERTYPE_PRE;
    }
    if (Input.getAxis("debugButton_Buffer3")) {
      Debug.currentBuffer = Debug.BUFFERTYPE_COLOUR;
    }
    if (Input.getAxis("debugButton_Buffer4")) {
      Debug.currentBuffer = Debug.BUFFERTYPE_NORMAL;
    }
    if (Input.getAxis("debugButton_Buffer5")) {
      Debug.currentBuffer = Debug.BUFFERTYPE_ROUGH;
    }
    if (Input.getAxis("debugButton_Buffer6")) {
      Debug.currentBuffer = Debug.BUFFERTYPE_METAL;
    }
    if (Input.getAxis("debugButton_Buffer7")) {
      Debug.currentBuffer = Debug.BUFFERTYPE_BLOOM;
    }
    if (Input.getAxis("debugButton_Buffer8")) {
      Debug.currentBuffer = Debug.BUFFERTYPE_SHADOW;
    }
    if (Input.getAxis("debugButton_Buffer9")) {
      Debug.currentBuffer = 0;
    }
    if (Input.getAxis("debugButton_Buffer0")) {
      Debug.currentBuffer = 0;
    }
  }
};

Debug.bufferTypeCount = 8;
Debug.BUFFERTYPE_NONE = 0;
Debug.BUFFERTYPE_PRE = 1;
Debug.BUFFERTYPE_COLOUR = 2;
Debug.BUFFERTYPE_NORMAL = 3;
Debug.BUFFERTYPE_ROUGH = 4;
Debug.BUFFERTYPE_METAL = 5;
Debug.BUFFERTYPE_BLOOM = 6;
Debug.BUFFERTYPE_SHADOW = 7;
Debug.currentBuffer = Debug.BUFFERTYPE_NONE;

Debug.currentLightIndex = 1; //TODO make this switchable with input


Debug.displayOpen = false;
Debug.fpsElement = null;
Debug.exposureElement = null;
Debug.lastTime=-1;
Debug.frames=0;
Debug.logFPS = function() {
  if (Debug.lastTime === -1) Debug.lastTime = new Date().getTime();
  Debug.frames++;
  let current = new Date().getTime();
  let duration = (current - Debug.lastTime) / 1000.0;
  if (duration >= 1) {
    console.log(Debug.frames);
    let fpsString = "FPS: " + Math.floor(Debug.frames/duration);
    Debug.fpsElement.innerText = fpsString;

    Debug.frames = 0;
    Debug.lastTime = current;
  }
};


Debug.logExposure = function() {
  Debug.exposureElement.innerText = "Exposure: " + Renderer.postPass.averageExposure;
};


//Go through Debug, so easier to find and remove;
Debug.log = console.log;
Debug.error = console.error;

Debug.assert = function(shouldBeTrue) {
  if (shouldBeTrue === false) {
    throw new Error("Assertion Failed");
  }
};

Debug._timer = 0;
Debug.startTimer = function () {
  Debug._timer = new Date().getTime();
};

Debug.getTimerDuration = function(name) {
  let duration = new Date().getTime() - Debug._timer;
  console.log(name + " " + duration);
  return duration;
};

// Debugging bools for collision
Debug.collision = {};
Debug.collision.printInfo = false;
Debug.collision.printOverlapSphere = false;
Debug.collision._infoTypes = {all: "all", triggerOnly: "triggerOnly", nonTriggerOnly: "nonTriggerOnly"}; // 'all' is default
Debug.collision._currInfoType = Debug.collision._infoTypes.triggerOnly;

Debug.printCollisionInfo = function(collisionEvent, gameObject, isTrigger){
  switch(Debug.collision._currInfoType){
    case Debug.collision._infoTypes.triggerOnly:
      if(isTrigger){
        console.log("TRIGGER event. (" + gameObject.name + ")");
        console.log("\tCollided with body:", collisionEvent.body);
        console.log("\tContact between bodies:", collisionEvent.contact);
      }
      break;
    case Debug.collision._infoTypes.nonTriggerOnly:
      if(!isTrigger){
        console.log("COLLISION event. (" + gameObject.name + ")");
        console.log("\tCollided with body:", collisionEvent.body);
        console.log("\tContact between bodies:", collisionEvent.contact);
      }
      break;
    default:
      if(isTrigger)
        console.log("TRIGGER event. (" + gameObject.name + ")");
      else
        console.log("COLLISION event. (" + gameObject.name + ")");

      console.log("\tCollided with body:", collisionEvent.body);
      console.log("\tContact between bodies:", collisionEvent.contact);
      break;
  }
};

Debug.printOverlapSphereInfo = function(checkingObj, distance, radius){
  console.log("TestingObj [distance^2, radius^2]: ", checkingObj, " [" + distance + ", " + radius + "]");
};

Debug.makeDefaultMaterial = function() {
  let mat = new Material(Renderer.getShader(Renderer.DEFERRED_PBR_SHADER));

  let color = vec4.create();
  vec4.set(color, 0.5, 0.5, 0.5, 1);
  mat.setTexture(MaterialTexture.COLOR, Texture.makeColorTex(color));

  vec4.set(color, 0.5, 0.5, 1, 1);
  mat.setTexture(MaterialTexture.NORMAL, Texture.makeColorTex(color));

  vec4.set(color, 1, 0, 0.05, 1); //metalness, blank, roughness
  mat.setTexture(MaterialTexture.MAT, Texture.makeColorTex(color));

  return mat;
};