class KeyEvent extends Event{

  constructor(){
    super();
    // this.movementSpeed = REGULAR_SPEED;
    this.setCurrentState(EventState.uncharged);
    this._unlocked = false;
  }

  start(){
    this._collider = this.transform.gameObject.getComponent("Collider");
    //this._singer = this.transform.gameObject.getComponent("Sing");
    this._collider.setPhysicsMaterial(PhysicsEngine.materials.basicMaterial);
    this._collider.setFreezeRotation(true);
  }

  startClient(){
    // this._singingSrc = this.transform.gameObject.getComponent("AudioSource");
  }

  // updateComponent(){
  //   if (this._unlocked)
  //   {
  //     super.updateComponent();
  //   }
  // }

  onUncharged(){

  }

  onCharged(){
  }

  onDischarging(){

  }

  onCharging(){

  }

  onRaycast(interactingObj){
    // Debug.log("haiyai");
    //TODO Make this cleaner! Or maybe add to playerobject
    // // this.transform.gameObject.parent=null;
    // this.transform._parent.children[]
    this.transform.gameObject.removeChildFromParent();
    interactingObj.addChild(this.transform.gameObject);
    let player = interactingObj.getComponent("PlayerController");
    if(player && player!==null){
      player.keys++;
      let audio = this.gameObject.getComponent("AudioSource");
      if(audio && audio!==null) audio.setState(AudioState.play2dSound);
    }
    this.transform.scale(50);

    this.transform.setPosition([30,0,20]);
    // delete this.transform.gameObject.components['Mesh'];
    delete this.transform.gameObject.components['Viewable'];
    delete this.transform.gameObject.components['Collider'];
  }
}