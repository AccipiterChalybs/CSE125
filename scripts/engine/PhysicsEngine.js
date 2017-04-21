/**
 * Created by Stephen on 4/18/2017.
 */

let PhysicsEngine = {};

const TIME_STEP = 1.0/60.0;

PhysicsEngine.world = new CANNON.World();

PhysicsEngine.init = function(){
  PhysicsEngine.world.gravity.set(0, -30, 0);
  PhysicsEngine.world.broadphase = new CANNON.NaiveBroadphase();

  // temporary testing stuff
  PhysicsEngine.world.addEventListener("beginContact", function(e){console.log("begin contact")});

  /*
  PhysicsEngine.world.defaultContactMaterial.contactEquationStiffness = 5e7;
  PhysicsEngine.world.defaultContactMaterial.contactEquationRelaxation = 4;
  let physicsMaterial = new CANNON.Material("slipperyMaterial");
  let physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
    physicsMaterial,
    0.0, // friction coefficient
    0.3  // restitution
  );
  // We must add the contact materials to the world
  PhysicsEngine.world.addContactMaterial(physicsContactMaterial);
*/
  let groundShape = new CANNON.Plane();
  let groundBody = new CANNON.Body({ mass: 0, shape: groundShape });
  groundBody.position.set(0, 0, 0);
  groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
  PhysicsEngine.world.add(groundBody);
};

PhysicsEngine.update = function(){
    PhysicsEngine.world.step(TIME_STEP);
};