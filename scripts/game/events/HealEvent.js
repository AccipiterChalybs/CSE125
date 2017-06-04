class HealEvent extends RaycastEvent{

  constructor() {
    super({});

  }

  onRaycast(interactingObj) {
    //TODO Make this cleaner! Or maybe add to playerobject
    // // this.transform.gameObject.parent=null;
    // this.transform._parent.children[]
    Debug.log("hello");
    let player = interactingObj.getComponent('PlayerController');
    if (player && player !== null) {
      if (player.injured) {
        player.heal();
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
