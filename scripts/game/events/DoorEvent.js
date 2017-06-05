// const REGULAR_SPEED = 4;
// const WALK_SPEED = 2;
// const SING_SPEED = 0.8;
// const PLAYER_ACCELERATION = 4;
// const COOLDOWN_SINGING = 0.1;   // In seconds

class DoorEvent extends SingingEvent{
  constructor(params = {maximumCharge: 3, _unlocked: true, openPos: vec3.create(), closePos: vec3.create()}){
    super({maximumCharge: params.maximumCharge});

    this.setCurrentState(EventState.uncharged);
    this.openPos = vec3.copy(vec3.create(), params.openPos);
    this.closePos = vec3.copy(vec3.create(), params.closePos);

    this._unlocked = params._unlocked;
    this._audioSrc = null;
  }

  start() {
  }

  startClient() {
    this._audioSrc = this.transform.gameObject.getComponent('AudioSource');
  }

  updateComponent() {
    super.updateComponent();
  }

  updateComponentClient(){
    if(this._audioSrc && this._audioSrc !== null) {
      if (this._currentState === EventState.discharging || this._currentState === EventState.charging) {
        this._audioSrc.playSound();
      } else {
        this._audioSrc.pauseSound();
      }
    }
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
}
