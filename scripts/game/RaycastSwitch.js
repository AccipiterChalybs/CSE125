class RaycastSwitch extends Viewable{
  constructor({event}) {
    super();
    this._event = event;
    this.charged = false;
    this._currentCharge = 0;
  }

  start() {
    this._collider = this.transform.gameObject.getComponent('Collider');
    //this._singer = this.transform.gameObject.getComponent("Sing");
    this._collider.setPhysicsMaterial(PhysicsEngine.materials.basicMaterial);
    this._collider.setFreezeRotation(true);
  }

  updateComponent() {

  }

  view(interactingObj) {
    Debug.log("Did senpai notice me?");
    this._event.onRaycast(interactingObj);
  }
}
