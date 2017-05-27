class HealEvent extends Event{

  constructor() {
    super();
    // this.movementSpeed = REGULAR_SPEED;
    this.setCurrentState(EventState.uncharged);
  }

  start() {
    this._collider = this.transform.gameObject.getComponent('Collider');
    //this._singer = this.transform.gameObject.getComponent("Sing");
    this._collider.setPhysicsMaterial(PhysicsEngine.materials.basicMaterial);
    this._collider.setFreezeRotation(true);
  }

  startClient() {
    // this._singingSrc = this.transform.gameObject.getComponent("AudioSource");
  }

  // updateComponent(){
  //   if (this._unlocked)
  //   {
  //     super.updateComponent();
  //   }
  // }

  onUncharged() {

  }

  onCharged() {
  }

  onDischarging() {

  }

  onCharging() {

  }

  onRaycast(interactingObj) {
    //TODO Make this cleaner! Or maybe add to playerobject
    // // this.transform.gameObject.parent=null;
    // this.transform._parent.children[]
    let player = interactingObj.getComponent('PlayerController');
    if (player && player !== null) {
      if (player.injured) {
        player.injured = false;
        Debug.log('HEALING');
        let audio = this.gameObject.getComponent('AudioSource');
        if (audio && audio !== null) {
          audio.setState(AudioState.playSound);
          // if(!IS_SERVER){
          //   SoundEngine.playSound2d(SoundEngine.heal);
          // }
        }
      }


      // if(!IS_SERVER) {
      //   SoundEngine.playSound2d(SoundEngine.heal);
      //   Debug.log("INSIDE THIS HEAL");
      // }
    }
  }
}
