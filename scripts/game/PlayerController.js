/**
 * Created by Stephen on 4/15/2017.
 */

const MOVEMENTSPEED = 2;
const COOLDOWN_SINGING = 3.0;   // In seconds

// Requires a collider
class PlayerController extends Component{
  constructor(){
    super();
    this.componentType = "PlayerController";
    this.movementSpeed = MOVEMENTSPEED;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.mouseDown = 0;
    this.forward = vec3.create(); vec3.set(this.forward,0,0,-1);
  }

  start(){
    this.transform.gameObject.getComponent("Collider").setPhysicsMaterial(PhysicsEngine.materials.playerMaterial);
  }

  updateComponent(){
    // Add if loop to enable client side testing w/o server
    if(Debug.clientUpdate && !IS_SERVER)
    {
      this.x = Input.getAxis('horizontal');
      this.z = Input.getAxis('vertical');
      this.mouseDown = Input.getAxis('mouseDown');

      this.forward = Renderer.camera.transform.getForward();
    }

    this.movement();

    if(this.mouseDown === 1) {
      this.sing();
    }
  }

  movement(){
    // if(x !== 0 || z !== 0) {
    //   console.log("moving");
    // }
    let up = vec3.create(); vec3.set(up, 0, 1, 0);
    let move = vec3.create();
    let moveX = vec3.create(); vec3.cross(moveX, this.forward, up);
    let moveZ = vec3.create(); vec3.cross(moveZ, up, moveX);
    vec3.normalize(moveX, moveX);
    vec3.normalize(moveZ, moveZ);
    vec3.scale(moveX, moveX, this.x*this.movementSpeed);
    vec3.scale(moveZ, moveZ, this.z* this.movementSpeed);
    vec3.add(move, moveX, moveZ);

    let body = this.transform.gameObject.getComponent("Collider").body;
    body.velocity.x = move[0];
    body.velocity.z = move[2];

  }

  sing(){
    // console.log("singing!");
  }
}