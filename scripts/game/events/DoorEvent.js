// const REGULAR_SPEED = 4;
// const WALK_SPEED = 2;
// const SING_SPEED = 0.8;
// const PLAYER_ACCELERATION = 4;
// const COOLDOWN_SINGING = 0.1;   // In seconds

const OPEN_SPEED = 0.5;
const CLOSE_SPEED = 0.5;

class DoorEvent extends SingingEvent{
  constructor(params = {maximumCharge: 3, _unlocked: true, openPos: vec3.create(), closePos: vec3.create()}){
    super({maximumCharge: params.maximumCharge});

    this.setCurrentState(EventState.uncharged);
    this.openPos = vec3.copy(vec3.create(), params.openPos);
    this.closePos = vec3.copy(vec3.create(), params.closePos);

    this._unlocked = params._unlocked;
  }

  start() {
  }

  startClient() {
  }

  updateComponent() {
    super.updateComponent();
  }

  onUncharged() {
    // Debug.log("Fully Discharged... ", this);
    this.transform.setPosition(this.closePos);
  }

  onCharged() {
    // Debug.log("Fully Charged... ", this);
    this.transform.setPosition(this.openPos);
  }

  onDischarging() {
    // Debug.log("Discharging... ", this);
    let newPos = vec3.scale(vec3.create(), this.openPos, this.currentCharge / this.maximumCharge);
    this.transform.setPosition(newPos);
  }

  onCharging() {
    // Debug.log("Charging... ", this);
    let newPos = vec3.scale(vec3.create(), this.openPos, this.currentCharge / this.maximumCharge);
    this.transform.setPosition(newPos);
  }
  // onRaycast(interactingObj) {
  //   let pController = interactingObj.getComponent('PlayerController');
  //   // Debug.log(this._unlocked,pController.keys);
  //   if (!this._unlocked && pController && pController !== null && pController.keys > 0) {
  //     Debug.log('unlocking');
  //     let audio = this.gameObject.getComponent('AudioSource');
  //     if (audio && audio !== null) audio.setState(AudioState.playSound);
  //     this._unlocked = true;
  //     pController.keys--; //Becareful in future here is HACK what if has lots of keys
  //     // interactingObj.transform.children.splice(0, 1);
  //   }
  // }

}
