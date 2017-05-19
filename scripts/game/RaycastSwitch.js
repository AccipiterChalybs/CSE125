class RaycastSwitch extends Viewable{
  constructor({event, activationLevel}) {
    super();
    this._event = event;
    this.activationLevel = activationLevel;
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
    this._event.onRaycast(interactingObj);
  }
}
