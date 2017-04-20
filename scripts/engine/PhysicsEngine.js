/**
 * Created by Stephen on 4/18/2017.
 */

let PhysicsEngine = {};

const TIME_STEP = 1.0/60.0;

PhysicsEngine.world = new CANNON.World();

PhysicsEngine.init = function(){
  PhysicsEngine.world.gravity.set(0, -30, 0);
  PhysicsEngine.world.broadphase = new CANNON.NaiveBroadphase();

  var settings = this.settings = {
    stepFrequency: 60,
    quatNormalizeSkip: 2,
    quatNormalizeFast: true,
    gx: 0,
    gy: 0,
    gz: 0,
    iterations: 3,
    tolerance: 0.0001,
    k: 1e6,
    d: 3,
    scene: 0,
    paused: false,
    rendermode: "solid",
    constraints: false,
    contacts: false,  // Contact points
    cm2contact: false, // center of mass to contact points
    normals: false, // contact normals
    axes: false, // "local" frame axes
    particleSize: 0.1,
    shadows: false,
    aabbs: false,
    profiling: false,
    maxSubSteps:3
  };

  // temporary testing stuff
  let physicsMaterial = new CANNON.Material("slipperyMaterial");
  let physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
    physicsMaterial,
    0.0, // friction coefficient
    0.3  // restitution
  );
  // We must add the contact materials to the world
  //PhysicsEngine.world.addContactMaterial(physicsContactMaterial);

  let groundShape = new CANNON.Plane();
  let groundBody = new CANNON.Body({ mass: 0, shape: groundShape });
  groundBody.position.set(0, 0, 0);
  groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
  PhysicsEngine.world.add(groundBody);
};

PhysicsEngine.update = function(){
    PhysicsEngine.world.step(TIME_STEP);
};