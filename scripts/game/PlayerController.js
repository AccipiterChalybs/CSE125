/**
 * Created by Stephen on 4/15/2017.
 */

const REGULAR_SPEED = 4;
const WALK_SPEED = 2;
const SING_SPEED = 0.8;
const PLAYER_ACCELERATION = 4;
const COOLDOWN_SINGING = 3.0;   // In seconds

// Requires a collider, sing
class PlayerController extends Component{
  constructor(){
    super();
    this.componentType = "PlayerController";
    this.movementSpeed = REGULAR_SPEED;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.singing = 0;
    this.walking = 0;
    this.forward = vec3.create(); vec3.set(this.forward,0,0,-1);
    this.canMove = true;

    this._collider = null;
    this._singer = null;
  }

  start(){
    this._collider = this.transform.gameObject.getComponent("Collider");
    this._singer = this.transform.gameObject.getComponent("Sing");
    this._audioSrc = this.transform.gameObject.getComponent("AudioSource");

    this._collider.setPhysicsMaterial(PhysicsEngine.materials.playerMaterial);
  }

  updateComponent(){
    // Add if loop to enable client side testing w/o server
    if(Debug.clientUpdate && !IS_SERVER)
    {
      this.x = Input.getAxis('horizontal');
      this.z = Input.getAxis('vertical');
      this.singing = Input.getAxis('sing');
      this.walking = Input.getAxis('walk');

      this.forward = Renderer.camera.transform.getForward();
    }

    if(this.canMove) {
      this.movement();
    }

    if(this.singing === 1) {
      this._singer.sing();
      this._audioSrc.resumeSound();
    }else{
      this._audioSrc.pauseSound();
    }
  }

  movement(){
    if(this.singing === 1){
      this.movementSpeed = Utility.moveTowards(this.movementSpeed, SING_SPEED, PLAYER_ACCELERATION * Time.deltaTime);
    } else if(this.walking === 1){
      this.movementSpeed = Utility.moveTowards(this.movementSpeed, WALK_SPEED, PLAYER_ACCELERATION * Time.deltaTime);
    } else{
      this.movementSpeed = Utility.moveTowards(this.movementSpeed, REGULAR_SPEED, PLAYER_ACCELERATION * Time.deltaTime);
    }

    let up = vec3.create(); vec3.set(up, 0, 1, 0);
    let move = vec3.create();
    let moveX = vec3.create(); vec3.cross(moveX, this.forward, up);
    let moveZ = vec3.create(); vec3.cross(moveZ, up, moveX);
    vec3.normalize(moveX, moveX);
    vec3.normalize(moveZ, moveZ);
    vec3.scale(moveX, moveX, this.x * this.movementSpeed);
    vec3.scale(moveZ, moveZ, this.z * this.movementSpeed);
    vec3.add(move, moveX, moveZ);

    let body = this._collider.body;
    body.velocity.x = move[0];
    body.velocity.z = move[2];

  }
}