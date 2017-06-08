/**
 * Created by Stephen on 5/2/2017.
 */

class SimonSaysSwitch extends SingingSwitch {
  constructor(params = {events : null, maximumOutput: 5, lossRate: 0.5, timeBeforeLoss: 2}) {
    super(params);
    // this.componentType = "SimonSaysSwitch";
  }

  start() {
    this._lock = this.transform.gameObject.getComponent('Lock');
    for(let i = 0; i < this._unparsedEvents.length; ++i){
      this._events.push(GameObject.prototype.SerializeMap[this._unparsedEvents[i]].getComponent("SimonSays"));
    }
  }

  updateComponent() {
    if(!(this._lock && this._lock !== null) || this._lock._unlocked ) {
      if (Time.time - this._lastSingTime >= this.timeBeforeLoss) {
      } else {
        for(let simon of this._events){
          simon.simonHeard(this.transform.gameObject.id);
        }
      }
    }
  }

  listen(interactingObj) {
    let singer = interactingObj.getComponent('Sing');
    let player = interactingObj.getComponent('PlayerController');
    // console.log("player is interacting with me. ", this.gameObject);
    if (singer && singer !== null && player && player !== null) {
      this._lastSingTime = Time.time;
    }
  }
}
