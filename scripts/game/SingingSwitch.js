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
    this._light = null;
    this._lightColor = vec3.fromValues(1,1,1);
    this._startLightRange = 0;
  }

  start() {
    this._lock = this.transform.gameObject.getComponent('Lock');
    this._light = this.transform.gameObject.getComponent('Light');
    // Debug.log("INSIDE SINGING SWITCH START");
    for(let i = 0; i < this._unparsedEvents.length; ++i){
      this._events.push(GameObject.prototype.SerializeMap[this._unparsedEvents[i]].getComponent("Event"));
    }

    if(this._light && this._light !== null){
      this._startLightRange = this._light.range;

      if(this._lock && this._lock !== null){
        this._light.setRange(0);
      }
    }
  }

  updateComponent() {
    if(!(this._lock && this._lock !== null) || this._lock._unlocked ) {
      if(this._light && this._light !== null) {
        this._light.setRange(this._startLightRange);
      }

      if (Time.time - this._lastSingTime >= this.timeBeforeLoss) {
        this._currentOutput = Utility.moveTowards(this._currentOutput, 0, this.lossRate * Time.deltaTime);
      } else {
        this._currentOutput = Utility.moveTowards(this._currentOutput, this.maximumOutput, Time.deltaTime);
      }

      for (let event of this._events) {
        event.charge(this._currentOutput);
      }
    }

    if(this._light && this._light !== null){
      this._light.setColor(Utility.vec3.moveTowards(this._light.color, this._lightColor, Time.deltaTime));
      vec3.set(this._lightColor, 1, 1, 1);
    }
  }

  listen(interactingObj) {

    let singer = interactingObj.getComponent('Sing');

    // console.log("player is interacting with me. ", this.gameObject.name);
    if (singer && singer !== null) {
      this._lastSingTime = Time.time;
      let singerLight = interactingObj.getComponent('Light');
      if(singerLight && singerLight !== null){
        vec3.add(this._lightColor, this._lightColor, singerLight.color);
      }
    }
  }
}
