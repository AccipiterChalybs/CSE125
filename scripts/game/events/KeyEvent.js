class KeyEvent extends RaycastEvent{

  constructor() {
    super();
    // this.movementSpeed = REGULAR_SPEED;
  }

  start() {
    this._collider = this.transform.gameObject.getComponent('Collider');
    //this._singer = this.transform.gameObject.getComponent("Sing");
    this._collider.setPhysicsMaterial(PhysicsEngine.materials.basicMaterial);
    this._collider.setFreezeRotation(true);
  }

  onRaycast(interactingObj) {
    // Debug.log("haiyai");
    //TODO Make this cleaner! Or maybe add to playerobject
    // // this.transform.gameObject.parent=null;
    // this.transform._parent.children[]
    // this.transform.gameObject.removeChildFromParent();
    // interactingObj.addChild(this.transform.gameObject);
    // this.transform.setWorldPosition([100,100,100]);
    let player = interactingObj.getComponent('PlayerController');
    if (player && player !== null) {
      this.transform.scale(.001);
      player.keys++;
      player.setCurrentState(PlayerState.dead);
      this.transform.gameObject.getComponent('Collider').setLayer(FILTER_DEFAULT);
      let audio = this.gameObject.getComponent("AudioSource");
      if(audio && audio!==null) audio.setState(AudioState.playSound);

    }

    // this.transform.scale(50);

    // this.transform.setPosition([30,0,20]);
    // delete this.transform.gameObject.components['Mesh'];
  }
}
