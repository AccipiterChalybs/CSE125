/**
 * Created by Stephen on 4/15/2017.
 */

const REGULAR_SPEED = 4;
const WALK_SPEED = 2;
const SING_SPEED = 0.8;
const PLAYER_ACCELERATION = 4;
const CHAR_NAME = "CAIN"; // CUZ I GOT 1 KEY and 0 bombs
const COOLDOWN_SINGING = 0.1;   // In seconds

const PlayerState = {
  default: "default",
  walking: "walking",
  singing: "singing",
  noControl: "noControl",
  cantMove: "cantMove",
  dead: "dead"
};

// Requires a collider, sing
class PlayerController extends Playerable{
  constructor(){
    super({singingCooldown: COOLDOWN_SINGING});
    this._looker = null;
    this.checkpoint = null;
    this.keys = 0;
    this.injured = false;

    this.state = new PlayerLogicState();
    this.state.status = 'default';
    this.state.moveSpeed = REGULAR_SPEED;
  }

  start(){
    super.start();
    this._looker = this.transform.gameObject.getComponent("Look");
    this.state.start(this.gameObject);
    this.transform.gameObject.getComponent("Collider").setLayer(FILTER_PLAYER);
    this.checkpoint = this.transform.getWorldPosition();

  }

  startClient(){
    super.startClient();
  }

  updateComponentClient(){
    if(!this.injured&& this.singing === 1 && Time.time >= this._nextSingTime) {
      this._singingSrc.playSound();
    }else{
      this._singingSrc.pauseSound();
    }
  }

  updateComponent(){
    if(this._currentState === PlayerState.dead){
      Debug.log('INSIDE DEAD');
      this.transform.setWorldPosition(this.checkpoint);
      this._currentState = PlayerState.default;
      return;
    }
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
      this._nextSingTime = Time.time + this._singingCooldown;
      // if(!IS_SERVER) this._singingSrc.pauseSound();
    }

    this._lastSingInput = this.singing;

    if(this.state.status === 'cantMove'){

    }else if(!this.injured && this.singing === 1 && Time.time >= this._nextSingTime) {
      this.state.status = 'singing';
      //if !injured

      // if(!IS_SERVER) this._singingSrc.resumeSound();
      //
    }else if(this.walking === 1){
      this.state.status = 'walking';
    }else{
      this.state.status = 'default';
    }

    if(this.state.status !== 'cantMove') {
      this.movement();
    }

    if(this.state.status === 'singing'){
      this._singer.sing();
    }else{
      this._singer.quiet();
    }

    if(this.action === 1){
      this._looker.look();
    }

    this.state.update();
  }


  movement(){
    if(this.state.status === 'singing'){
      this.state.moveSpeed = Utility.moveTowards(this.state.moveSpeed, SING_SPEED, 4 * PLAYER_ACCELERATION * Time.deltaTime);
    } else if(this.state.status === 'walking'){
      this.state.moveSpeed = Utility.moveTowards(this.state.moveSpeed, WALK_SPEED, PLAYER_ACCELERATION * Time.deltaTime);
    } else if(this.state.status === 'default'){
      this.state.moveSpeed = Utility.moveTowards(this.state.moveSpeed, REGULAR_SPEED, PLAYER_ACCELERATION * Time.deltaTime);
    }

    let up = vec3.create(); vec3.set(up, 0, 1, 0);
    let move = vec3.create();
    let moveX = vec3.create(); vec3.cross(moveX, this.forward, up);
    let moveZ = vec3.create(); vec3.cross(moveZ, up, moveX);
    vec3.normalize(moveX, moveX);
    vec3.normalize(moveZ, moveZ);
    vec3.scale(moveX, moveX, this.x * this.state.moveSpeed);
    vec3.scale(moveZ, moveZ, this.z * this.state.moveSpeed);
    vec3.add(move, moveX, moveZ);
    vec3.normalize(move, move);
    vec3.scale(move, move, this.state.moveSpeed);

    this.state.moveAmt = vec3.length(move);

    if (this.state.moveAmt > 0.01) {
      this.transform.setRotation(quat.create());
      this.transform.rotateY(Math.atan2(-move[2], move[0]) - Math.PI / 2);
      let animState = (this.state.status === 'singing') ? 2 : 3;
      // if (this.gameObject.getComponent('Animation'))this.gameObject.getComponent('Animation').play(2, true);
      // if (this.gameObject.getComponent('Animation'))this.gameObject.getComponent('Animation').resume();
    } else {
      // if (this.gameObject.getComponent('Animation'))this.gameObject.getComponent('Animation').stop();
      // if (this.gameObject.getComponent('Animation'))this.gameObject.getComponent('Animation').play(1, true);
    }


    /*let body = this._collider.body;
     body.velocity.x = move[0];
     body.velocity.z = move[2];*/
    //col.setRotation(this.forward);
  }


  getCurrentState(){
    return this.state.status;
  }

  setCurrentState(newState){
    this.state.status = newState;
    return data;
  }

  serialize() {
    let data = super.serialize();
    data.i = this.injured;
    data.k = this.keys;
    return data;
  }

  applySerializedData(data) {
    // Debug.log(this);
    super.applySerializedData(data);
    this.injured = data.i;
    this.keys = data.k;
  }


}