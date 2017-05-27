class RaycastSwitch extends Viewable{
  constructor({events}) {
    super();
    this._events = events;
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
    for(let event of this._events)
    {
      event.onRaycast(interactingObj);
    }
  }
}
