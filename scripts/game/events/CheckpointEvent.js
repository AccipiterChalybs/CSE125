class CheckpointEvent extends RaycastEvent{

  constructor(){
    super();
  }

  start(){
    this._collider = this.transform.gameObject.getComponent("Collider");
    //this._singer = this.transform.gameObject.getComponent("Sing");
    this._collider.setPhysicsMaterial(PhysicsEngine.materials.basicMaterial);
    this._collider.setFreezeRotation(true);
  }

  onRaycast(interactingObj){
    // Debug.log("haiyai");
    //TODO Make this cleaner! Or maybe add to playerobject
    // // this.transform.gameObject.parent=null;
    // this.transform._parent.children[]
    // this.transform.gameObject.removeChildFromParent();
    // interactingObj.addChild(this.transform.gameObject);
    // this.transform.setWorldPosition([100,100,100]);
    let player = interactingObj.getComponent("PlayerController");
    if(player && player!==null){
      Debug.log("INSIDE CHECKPOINT RAYCAST");
      player.checkpoint = this.transform.position;//getWorldPosition();
    }
    // this.transform.scale(50);

    // this.transform.setPosition([30,0,20]);
    // delete this.transform.gameObject.components['Mesh'];
  }
}