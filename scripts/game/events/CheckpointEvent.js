class CheckpointEvent extends RaycastEvent{
  constructor({}){
    super({});
  }

  onRaycast(interactingObj){
    let player = interactingObj.getComponent("PlayerController");
    if(player && player!==null){
      // Debug.log("set checkpoint at: ", this.transform.getWorldPosition());
      player.checkpoint = this.transform.getWorldPosition();
    }
  }
}