/**
 * Created by Stephen on 4/18/2017.
 */

const PhysicsEngine = {};

const TIME_STEP = 1.0/60.0;
const GRAVITY = -20;

PhysicsEngine.world = new CANNON.World();

PhysicsEngine.init = function(){
  PhysicsEngine.world.gravity.set(0, GRAVITY, 0);
  PhysicsEngine.world.broadphase = new CANNON.NaiveBroadphase();

  // temporary testing stuff
  PhysicsEngine.createMaterials();

  //PhysicsEngine.world.addEventListener("beginContact", function(e){console.log("begin contact")});
};

PhysicsEngine.update = function(){
    PhysicsEngine.world.step(TIME_STEP);
};


// 'PM' is short for 'physics material'
PhysicsEngine.createMaterials = function(){
  let basicPM = new CANNON.Material("basicMaterial");
  // basicPM.friction = 0.3;
  // basicPM.restitution = 0.0;
  let playerPM = new CANNON.Material("playerMaterial");
  // playerPM.friction = 0.3;
  // playerPM.restitution = 0.0;

  PhysicsEngine.world.addMaterial(basicPM);
  PhysicsEngine.world.addMaterial(playerPM);

  let physicsContactMaterial = new CANNON.ContactMaterial(
    basicPM, basicPM,
    {friction: 0.3,
    restitution: 1.0}
  );
  PhysicsEngine.world.addContactMaterial(physicsContactMaterial);

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
}

PhysicsEngine.materials = {basicMaterial: 0, playerMaterial: 1};