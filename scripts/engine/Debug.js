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

Debug.printOverlapSphereInfo = function(checkingObj, distance, radius) {
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

// Debugging for NavMesh
Debug.navMesh = {};
Debug.navMesh.printPointTriangle = false; Debug.navMesh._printPointTriangleDetailed = false;
Debug.navMesh.printRaySegment = false; Debug.navMesh._printRaySegmentDetailed = true;
Debug.navMesh.printFindFace = false; Debug.navMesh._printFindFaceDetailed = true;
Debug.navMesh.printLoadFinished = false;

Debug.navMesh.printPointTriangleInfo = function(result, pt, v0, v1, v2, b0, b1, b2){
  let resultString = result ? "INSIDE" : "OUTSIDE";
  if(Debug.navMesh._printPointTriangleDetailed){
    console.log("NavMesh (Point in triangle) DETAILED:");
  }else{
    console.log("NavMesh (Point in triangle):");
  }
  console.log("\tRESULT: " + resultString);
  console.log("\tpoint: (" + pt[0] + ", " + pt[1] + ")");
  console.log("\ttriangle:");
  console.log("\t\tv0: (" + v0[0] + ", " + v0[1] + ")");
  console.log("\t\tv1: (" + v1[0] + ", " + v1[1] + ")");
  console.log("\t\tv2: (" + v2[0] + ", " + v2[1] + ")");

  if(Debug.navMesh._printPointTriangleDetailed){
    console.log("\tbooleans:");
    console.log("\t\tb0: " + b0);
    console.log("\t\tb0: " + b1);
    console.log("\t\tb0: " + b2);
  }
};

// s must be between 0 and 1 to lie on the line segment
Debug.navMesh.printRaySegmentInfo = function(hitResult, ray2D, segment, maxDistance, hitDistance, s){
  let hitResultString = hitResult ? "HIT" : "MISS";
  if(Debug.navMesh._printRaySegmentDetailed){
    console.log("NavMesh (Ray, segment intersection) DETAILED:");
  }else{
    console.log("NavMesh (Ray, segment intersection):");
  }
  console.log("\tRESULT: " + hitResultString);
  console.log("\tray2D: ");
  console.log("\t\torigin: (" + ray2D.origin[0] + ", " + ray2D.origin[1] + ", " + ray2D.origin[2] + ")");
  console.log("\t\tdirection: (" + ray2D.direction[0] + ", " + ray2D.direction[1] + ", " + ray2D.direction[2] + ")");
  console.log("\tsegment: ");
  console.log("\t\tpt0: (" + segment[0][0] + ", " + segment[0][1] + ", " + segment[0][2] + ")");
  console.log("\t\tpt1: (" + segment[1][0] + ", " + segment[1][1] + ", " + segment[1][2] + ")");

  if(Debug.navMesh._printRaySegmentDetailed){
    console.log("\thitDistance: " + hitDistance.dist);
    console.log("\tmaxDistance: " + maxDistance);
    console.log("\ttimeHitOnSegment: " + s);
  }
};

Debug.navMesh.printFindFaceInfo = function(pt, faceIndex, face){
  if(faceIndex !== -1) {
    console.log("Point (" + pt[0] + ", " + pt[1] + ", " + pt[2] + ") lies on face (" + faceIndex + ").");
    if(Debug.navMesh._printFindFaceDetailed){
      console.log("\tFace vertices: ", face[0], ", ", face[1], ", ", face[2]);

    }
  } else{
    console.log("Point (" + pt[0] + ", " + pt[1] + ", " + pt[2] + ") does NOT lie on a face.");
  }
};

Debug.navMesh.printLoadFinishedInfo = function(jsonObj){
  console.log("NavMesh (Loading Completed):");
  console.log("\tmeta: ", jsonObj.meta);
  console.log("\tfaceList: ", jsonObj.faceList);
  console.log("\tboundary: ", jsonObj.boundary);
};


Debug.drawTeapot = function(pos, color = null) {
  let rotation = quat.create();
  quat.rotateX(rotation, rotation, -Math.PI/2);

  let teapot = new GameObject();

  if (!IS_SERVER) {
    let mesh = new Mesh("Teapot02");
    let mat = new Material(Renderer.getShader(Renderer.FORWARD_PBR_SHADER));

    if (color === null) {
      color = vec4.create();
      vec4.set(color, 1, 0.5, 0.1, 1);
    }
    mat.setTexture(MaterialTexture.COLOR, Texture.makeColorTex(color));

    vec4.set(color, 0.5, 0.5, 1, 1);
    mat.setTexture(MaterialTexture.NORMAL, Texture.makeColorTex(color));

    vec4.set(color, 1, 0, 0.25, 1); //metalness, blank, roughness
    mat.setTexture(MaterialTexture.MAT, Texture.makeColorTex(color));

    mesh.setMaterial(mat);
    teapot.addComponent(mesh);
  }

  teapot.transform.setPosition(pos);
  teapot.transform.setRotation(rotation);
  teapot.transform.scale((.05));

  GameObject.prototype.SceneRoot.addChild(teapot);

  return teapot;
};


// Debugging for BehaviorTrees
Debug.behaviorTree = {};
Debug.behaviorTree.printAll = false;
Debug.behaviorTree.printStates = false;
Debug.behaviorTree.printErrors = false;
Debug.behaviorTree.printUniques = false;
Debug.behaviorTree.printFailures = false;
Debug.behaviorTree.printSuccesses = false;

