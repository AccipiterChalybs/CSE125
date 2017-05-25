/**
 * Created by Stephen on 4/15/2017.
 */

const REGULAR_SPEED = 4;
const WALK_SPEED = 2;
const SING_SPEED = 0.8;
const PLAYER_ACCELERATION = 4;
const COOLDOWN_SINGING = 0.1;   // In seconds
const CHAR_NAME = "CAIN"; // CUZ I GOT 1 KEY and 0 bombs
const MAX_LIGHT_RANGE = 8;
const MIN_LIGHT_RANGE = 1;
const LIGHT_EXPAND_RATE = 15;
const LIGHT_DIMINISH_RATE = 5;

const PlayerState = {
  default: "default",
  walking: "walking",
  singing: "singing",
  noControl: "noControl",
  cantMove: "cantMove"
};

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
    this.action = 0;
    this.forward = vec3.create(); vec3.set(this.forward,0,0,-1);
    this.keys = 0;

    this._collider = null;
    this._singer = null;
    this._singingSrc = null;
    this._nextSingTime = 0;
    this._lastSingInput = 0;
    this._currentState = PlayerState.default;
    this.injured = true;
  }

  start(){
    this._collider = this.transform.gameObject.getComponent("Collider");
    this._singer = this.transform.gameObject.getComponent("Sing");
    this._looker = this.transform.gameObject.getComponent("Look");
    this._pointLight = this.transform.gameObject.getComponent("Light");
    this._pointLight.setColor([4,3,0.25,1]);
    this._pointLight.setRange(1);
    this.transform.gameObject.getComponent("Collider").setLayer(FILTER_PLAYER);

    this._collider.setPhysicsMaterial(PhysicsEngine.materials.playerMaterial);
    this._collider.setFreezeRotation(true);
  }

  startClient(){
    this._singingSrc = this.transform.gameObject.getComponent("AudioSource");
  }

  updateComponentClient(){
    if(!this.injured&& this.singing === 1 && Time.time >= this._nextSingTime) {
      //this._singingSrc.resumeSound();
    }else{
      //this._singingSrc.pauseSound();
    }
  }

  updateComponent(){
    if(this._currentState === PlayerState.noControl)
      return;

    // Add if loop to enable client side testing w/o server
    if(Debug.clientUpdate && !IS_SERVER)
    {
      this.x = Input.getAxis('horizontal');
      this.z = Input.getAxis('vertical');
      this.walking = Input.getAxis('walk');
      this.singing = Input.getAxis('sing');
      this.action = Input.getAxis("action");

      this.forward = Renderer.camera.transform.getForward();
    }

    if(this.singing === 0 && this._lastSingInput === 1){
      this._nextSingTime = Time.time + COOLDOWN_SINGING;
      // if(!IS_SERVER) this._singingSrc.pauseSound();
    }

    this._lastSingInput = this.singing;

    if(this._currentState === PlayerState.cantMove){

    }else if(!this.injured && this.singing === 1 && Time.time >= this._nextSingTime) {
      this._currentState = PlayerState.singing;
      //if !injured
      this._singer.sing();

      // if(!IS_SERVER) this._singingSrc.resumeSound();
      //
    }else if(this.walking === 1){
      this._currentState = PlayerState.walking;
    }else{
      this._currentState = PlayerState.default;
    }

    if(this._currentState !== PlayerState.cantMove) {
      this.movement();
    }

    if(this._currentState === PlayerState.singing){
      this._pointLight.setRange(Utility.moveTowards(this._pointLight.range,MAX_LIGHT_RANGE,LIGHT_EXPAND_RATE*Time.deltaTime));
    }else{
      this._pointLight.setRange(Utility.moveTowards(this._pointLight.range,MIN_LIGHT_RANGE,LIGHT_DIMINISH_RATE*Time.deltaTime));
    }

    if(this.action === 1){
      this._looker.look();
    }
  }


  movement(){
    if(this._currentState === PlayerState.singing){
      this.movementSpeed = Utility.moveTowards(this.movementSpeed, SING_SPEED, 4 * PLAYER_ACCELERATION * Time.deltaTime);
    } else if(this._currentState === PlayerState.walking){
      this.movementSpeed = Utility.moveTowards(this.movementSpeed, WALK_SPEED, PLAYER_ACCELERATION * Time.deltaTime);
    } else if(this._currentState === PlayerState.default){
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
    vec3.normalize(move, move);
    vec3.scale(move, move, this.movementSpeed);


    if (vec3.length(move) > 0.01) {
      this.transform.setRotation(quat.create());
      this.transform.rotateY(Math.atan2(-move[2], move[0]) - Math.PI / 2);
      if (this.gameObject.getComponent('Animation'))this.gameObject.getComponent('Animation').play(2, true);
      if (this.gameObject.getComponent('Animation'))this.gameObject.getComponent('Animation').resume();
    } else {
      if (this.gameObject.getComponent('Animation'))this.gameObject.getComponent('Animation').stop();
      if (this.gameObject.getComponent('Animation'))this.gameObject.getComponent('Animation').play(1, true);
    }


    /*let body = this._collider.body;
     body.velocity.x = move[0];
     body.velocity.z = move[2];*/
    //col.setRotation(this.forward);
  }

  sing(){
    // console.log("singing!");
  }

  getCurrentState(){
    return this._currentState;
  }

  setCurrentState(newState){
    this._currentState = newState;
  }
}