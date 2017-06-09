class RaycastSwitch extends Viewable{
  constructor({events}) {
    super();
    this._events = [];
    this._unparsedEvents = events;
    this.charged = false;
    this._currentOutput = 0;
  }

  start() {
    // Debug.log(GameObject.prototype.SerializeMap);
    for(let i = 0; i < this._unparsedEvents.length; ++i){
      // Debug.log(GameObject.prototype.SerializeMap[events[i]]);
      // Debug.log(this._unparsedEvents[i]);
      let newEvent = GameObject.prototype.SerializeMap[this._unparsedEvents[i]].getComponent("Event");
      if(newEvent && newEvent !== null) {
        this._events.push(newEvent);
      }
      let newLock = GameObject.prototype.SerializeMap[this._unparsedEvents[i]].getComponent("Lock");
      if(newLock && newLock !== null) {
        this._events.push(GameObject.prototype.SerializeMap[this._unparsedEvents[i]].getComponent("Lock"));
      }
    }
    // Debug.log(this._events);

    // this._collider = this.transform.gameObject.getComponent('Collider');
    // this._collider.setPhysicsMaterial(PhysicsEngine.materials.basicMaterial);
    // this._collider.setFreezeRotation(true);
  }

  updateComponent() {
    // Debug.log(this.transform.getWorldPosition());
  }

  view(interactingObj) {
    // Debug.log("Viewable object has been viewed");
    for(let event of this._events) {
      event.onRaycast(interactingObj);
    }
  }
}
