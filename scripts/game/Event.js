const EventState = {
  uncharged: "uncharged",
  charged: "charged",
  discharging: "discharging",
  charging: "charging"
};

class Event extends Component{
  constructor(){
    super();
    this.componentType = "Event";
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

  updateComponentClient(){

  }

  updateComponent() {
    switch (this.getCurrentState()){
      case EventState.charged:
        this.onCharged();
        break;
      case EventState.uncharged:
        this.onUncharged();
        break;
      case EventState.charging:
        this.onCharging();
        break;
      case EventState.discharging:
        this.onDischarging();
        break;
    }
  }

  onUncharged(){

  }

  onCharged(){

  }

  onDischarging(){

  }

  onCharging(){
  }

  onRaycast(interactingObj){
  }

  getCurrentState(){
    return this._currentState;
  }

  setCurrentState(newState){
    this._currentState = newState;
  }
}