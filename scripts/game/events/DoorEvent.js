// const REGULAR_SPEED = 4;
// const WALK_SPEED = 2;
// const SING_SPEED = 0.8;
// const PLAYER_ACCELERATION = 4;
// const COOLDOWN_SINGING = 0.1;   // In seconds

const OPEN_SPEED = 0.5;
const CLOSE_SPEED = 0.5;

class DoorEvent extends Event{
  constructor(params = {openPosX: 0, openPosY: 0, openPosZ: 0,
    closePosX: 0, closePosY: 1.5, closePosZ: 0, _unlocked: false}) {
    super();

    this.setCurrentState(EventState.uncharged);
    this._unlocked = params._unlocked;
    this.openPos = vec3.fromValues(params.openPosX, params.openPosY, params.openPosZ);
    this.closePos = vec3.fromValues(params.closePosX, params.closePosY, params.closePosZ);
  }

  start() {
    this._collider = this.transform.gameObject.getComponent('Collider');
    this._collider.setPhysicsMaterial(PhysicsEngine.materials.basicMaterial);
    this._collider.setFreezeRotation(true);
  }

  startClient() {
  }

  updateComponent() {
    if (this._unlocked)
    {
      super.updateComponent();
    }
  }

  onUncharged() {
    // Debug.log("Fully discharged ", this);
    let newPos = Utility.vec3.moveTowards(this.transform.position, this.closePos, CLOSE_SPEED * Time.deltaTime);
    this.transform.setPosition(newPos);
  }

  onCharged() {
    // Debug.log("Fully charged ", this);
    let newPos = Utility.vec3.moveTowards(this.transform.position, this.openPos, OPEN_SPEED * Time.deltaTime);
    this.transform.setPosition(newPos);
  }

  onDischarging() {
    // Debug.log("Discharging... ", this);
    let newPos = Utility.vec3.moveTowards(this.transform.position, this.closePos, CLOSE_SPEED * Time.deltaTime);
    this.transform.setPosition(newPos);
    // if (this.transform.position[0] === this.closePos[0] && this.transform.position[1] === this.closePos[1] && this.transform.position[2] === this.closePos[2]) {
    //   this.setCurrentState(EventState.uncharged);
    // }
  }

  onCharging() {
    // Debug.log("Charging... ", this);
    let newPos = Utility.vec3.moveTowards(this.transform.position, this.openPos, OPEN_SPEED * Time.deltaTime);
    this.transform.setPosition(newPos);
    // if (this.transform.position[0] === this.openPos[0] && this.transform.position[1] === this.openPos[1] && this.transform.position[2] === this.openPos[2]) {
    //   this.setCurrentState(EventState.charged);
    // }
  }

  onRaycast(interactingObj) {
    let pController = interactingObj.getComponent('PlayerController');
    // Debug.log(this._unlocked,pController.keys);
    if (!this._unlocked && pController && pController !== null && pController.keys > 0) {
      Debug.log('unlocking');
      let audio = this.gameObject.getComponent('AudioSource');
      if (audio && audio !== null) audio.setState(AudioState.playSound);
      this._unlocked = true;
      pController.keys--; //Becareful in future here is HACK what if has lots of keys
      // interactingObj.transform.children.splice(0, 1);
    }
  }

}
