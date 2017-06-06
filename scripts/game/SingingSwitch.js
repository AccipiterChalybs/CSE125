/**
 * Created by Stephen on 5/2/2017.
 */

class SingingSwitch extends Listenable {
  constructor(params = {events : null, maximumOutput: 5, lossRate: 0.5, timeBeforeLoss: 2}) {
    super();
    this._events = [];
    this._unparsedEvents = params.events;

    this.maximumOutput = params.maximumOutput;
    this.lossRate = params.lossRate;
    this.timeBeforeLoss = params.timeBeforeLoss;

    this._lastSingTime = 0;
    this._currentOutput = 0;
    this._lock = null;
  }

  start() {
    this._lock = this.transform.gameObject.getComponent('Lock');
    for(let i = 0; i < this._unparsedEvents.length; ++i){
      this._events.push(GameObject.prototype.SerializeMap[this._unparsedEvents[i]].getComponent("Event"));
    }
  }

  updateComponent() {
    if(!(this._lock && this._lock !== null) || this._lock._unlocked ) {
      if (Time.time - this._lastSingTime >= this.timeBeforeLoss) {
        this._currentOutput = Utility.moveTowards(this._currentOutput, 0, this.lossRate * Time.deltaTime);
      } else {
        this._currentOutput = Utility.moveTowards(this._currentOutput, this.maximumOutput, Time.deltaTime);
      }

      for (let event of this._events) {
        event.charge(this._currentOutput);
      }
    }
  }

  listen(interactingObj) {

    let singer = interactingObj.getComponent('Sing');

    // console.log("player is interacting with me. ", this.gameObject);
    if (singer && singer !== null) {
      this._lastSingTime = Time.time;
    }
  }
}
