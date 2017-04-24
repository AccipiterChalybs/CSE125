/**
 * Created by Stephen on 4/15/2017.
 */

const MOVEMENTSPEED = 30;

// Requires a collider
class PlayerController extends Component{
  constructor(){
    super();
    this.componentType = "PlayerController";
    this.movementSpeed = MOVEMENTSPEED;
  }

  start(){
    this.transform.gameObject.getComponent("Collider").setPhysicsMaterial(PhysicsEngine.materials.playerMaterial);
  }

  updateComponent(){
    this.movement();
  }

  movement(){
    let x = Input.getAxis('horizontal');
    let z = Input.getAxis('vertical');

    //if(x !== 0 || z !== 0) {
      //console.log("moving");
    let up = vec3.create(); vec3.set(up, 0, 1, 0);

    let move = vec3.create();
    let moveX = vec3.create(); vec3.cross(moveX, Renderer.camera.transform.getForward(), up);
    let moveZ = vec3.create(); vec3.cross(moveZ, up, moveX);
    vec3.normalize(moveX, moveX);
    vec3.normalize(moveZ, moveZ);
    vec3.scale(moveX, moveX, x*this.movementSpeed);
    vec3.scale(moveZ, moveZ, z* this.movementSpeed);
    vec3.add(move, moveX, moveZ);

    let body = this.transform.gameObject.getComponent("Collider").body;
    body.velocity.x = move[0];
    body.velocity.z = move[2];
  }
}