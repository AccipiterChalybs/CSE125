class RaycastSwitch extends Viewable{
  constructor(params = {event: null}) {
    super();
    this._event = params.event;
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
    Debug.log("Viewable object has been viewed");
    this._event.onRaycast(interactingObj);
  }
}
