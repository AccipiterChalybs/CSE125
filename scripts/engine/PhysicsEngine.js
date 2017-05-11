/**
 * Created by Stephen on 4/18/2017.
 */

const PhysicsEngine = {};

const TIME_STEP = 1.0/60.0;
const GRAVITY = -20;
const DEFAULT_ANGULAR_DAMPING = 0.9; // How fast things will stop rotating
const FILTER_DEFAULT = 1;
const FILTER_LEVEL_GEOMETRY = 2;
const FILTER_TRIGGER = 4;
const FILTER_PLAYER = 8;
const FILTER_ENEMY = 16;
const FILTER_KINEMATIC = 32;

PhysicsEngine.world = new CANNON.World();
PhysicsEngine.bodyMap = {};
PhysicsEngine.sphereChecks = [];

PhysicsEngine.init = function(){
  PhysicsEngine.world.gravity.set(0, GRAVITY, 0);
  PhysicsEngine.world.broadphase = new CANNON.NaiveBroadphase();

  // temporary testing stuff
  PhysicsEngine.createMaterials();
  PhysicsEngine.layers = {"name":"layers"};
  PhysicsEngine.layers[FILTER_DEFAULT] = [];
  PhysicsEngine.layers[FILTER_LEVEL_GEOMETRY] = [];
  PhysicsEngine.layers[FILTER_TRIGGER] = [];
  PhysicsEngine.layers[FILTER_PLAYER] = [];
  PhysicsEngine.layers[FILTER_ENEMY] = [];
  PhysicsEngine.layers[FILTER_KINEMATIC] = [];

  //PhysicsEngine.world.addEventListener("beginContact", function(e){console.log("begin contact")});
};

PhysicsEngine.update = function(){
    PhysicsEngine.world.step(TIME_STEP);
};

PhysicsEngine.addBody = function(collider, body, type=FILTER_DEFAULT){
  PhysicsEngine.world.addBody(body);
  PhysicsEngine.layers[type].push(body.id);
  PhysicsEngine.bodyMap[body.id] = collider;
};

PhysicsEngine.getCollider = function(bodyID){
  return PhysicsEngine.bodyMap[bodyID];
};

// Returns an array of gameObjects that were hit
PhysicsEngine.overlapSphere = function(position, radius){
  let hitObjects = [];
  let radiusSqrd = radius * radius;

  for(let i = 0; i < PhysicsEngine.sphereChecks.length; ++i){
    let dist = vec3.squaredDistance(position, PhysicsEngine.sphereChecks[i].transform.getPosition());

    if(Debug.collision.printOverlapSphere) {
      Debug.printOverlapSphereInfo(PhysicsEngine.sphereChecks[i], dist, radiusSqrd);
    }
    if(dist !== 0 && dist <= radiusSqrd){
      hitObjects.push(PhysicsEngine.sphereChecks[i]);
    }
  }

  return hitObjects;
};

PhysicsEngine.dot2D = function(v0, v1){
  return v0[0] * v1[0] + v0[2] * v1[2];
};

// 'PM' is short for 'physics material'
PhysicsEngine.createMaterials = function(){
  let basicPM = new CANNON.Material("basicMaterial");
  let playerPM = new CANNON.Material("playerMaterial");

  PhysicsEngine.world.addMaterial(basicPM);
  PhysicsEngine.world.addMaterial(playerPM);

  let physicsContactMaterial = new CANNON.ContactMaterial(
    basicPM, basicPM,
    {friction: 0.8,
    restitution: 0.3}
  );
  PhysicsEngine.world.addContactMaterial(physicsContactMaterial);
  PhysicsEngine.world.defaultContactMaterial = physicsContactMaterial;

  physicsContactMaterial = new CANNON.ContactMaterial(
    playerPM, playerPM,
    {friction: 0.3,
    restitution: 0.2}
  );
  PhysicsEngine.world.addContactMaterial(physicsContactMaterial);

  physicsContactMaterial = new CANNON.ContactMaterial(
    basicPM, playerPM,
    {friction: 0.3,
    restitution: 0.0}
  );
  PhysicsEngine.world.addContactMaterial(physicsContactMaterial);
};

PhysicsEngine.materials = {basicMaterial: 0, playerMaterial: 1};

PhysicsEngine.getLayers = function(mask){
  bodies = [];
  if((mask&FILTER_DEFAULT)!==0){
    bodies = bodies.concat(PhysicsEngine.layers[FILTER_DEFAULT]);
  }
  if((mask&FILTER_LEVEL_GEOMETRY)!==0){
    bodies = bodies.concat(PhysicsEngine.layers[FILTER_LEVEL_GEOMETRY]);
  }
  if((mask&FILTER_TRIGGER)!==0){
    bodies = bodies.concat(PhysicsEngine.layers[FILTER_TRIGGER]);
  }
  if((mask&FILTER_PLAYER)!==0){
    bodies = bodies.concat(PhysicsEngine.layers[FILTER_PLAYER]);
  }
  if((mask&FILTER_ENEMY)!==0){
    bodies = bodies.concat(PhysicsEngine.layers[FILTER_ENEMY]);
  }
  if((mask&FILTER_KINEMATIC)!==0){
    bodies = bodies.concat(PhysicsEngine.layers[FILTER_KINEMATIC]);
  }
  return bodies;
};

PhysicsEngine.raycastClosest = function(origin,direction,maxDistance,mask,hit){

  let scaledDir = vec3.create();vec3.scale(scaledDir,direction,maxDistance); vec3.add(scaledDir,origin,scaledDir);
  // Debug.drawTeapot(origin,color=[1,0,0,1]);
  // Debug.drawTeapot(scaledDir,color=[0,1,0,1]);
  let cannonOrigin = {x:origin[0],y:origin[1],z:origin[2]};
  let cannonTo = {x:scaledDir[0],y:scaledDir[1],z:scaledDir[2]};
  let layers = PhysicsEngine.getLayers(mask);
  // Debug.log(layers);
  let closest = maxDistance;
  let isHit = false;
  let bodyId = -1;
  PhysicsEngine.world.raycastAll(cannonOrigin,cannonTo, {},function(result){
    if(layers.indexOf(result.body.id)>-1 && result.hasHit && result.distance<closest) {
      isHit = true;
      closest = result.distance;
      bodyId = result.body.id;

    }
  });
  if(isHit){
    // Debug.log(result);
    hit.distance =closest;
    let newPos = vec3.create();vec3.scale(newPos,direction,hit.distance);vec3.add(newPos,origin,newPos);
    hit.position = newPos;
    hit.collider = PhysicsEngine.bodyMap[bodyId];

    return true;
  }
  return false;
};