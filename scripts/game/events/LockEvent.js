class LockEvent extends RaycastEvent{

  constructor() {
    super();
    this._unlocked = false;
    this.componentType = "Lock";
    // this.movementSpeed = REGULAR_SPEED;
  }

  start() {

  }

  onRaycast(interactingObj) {
    let pController = interactingObj.getComponent('PlayerController');
    // Debug.log(this._unlocked,pController.keys);
    if (!this._unlocked && pController && pController !== null && pController.keys > 0) {
      // Debug.log('unlocking');
      let audio = this.gameObject.getComponent('AudioSource');
      if (audio && audio !== null) audio.setState(AudioState.playSound);
      this._unlocked = true;
      pController.keys--; //Becareful in future here is HACK what if has lots of keys
      // interactingObj.transform.children.splice(0, 1);
    }
  }
}
