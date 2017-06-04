/**
 * Created by Stephen on 6/4/2017.
 */

class StopLightEvent extends RaycastEvent{
  constructor(params = {lights: []}) {
    super({});

    this._lights = [];
    this._unparsedLights = params.lights;
  }

  start(){
    for(let i = 0; i < this._unparsedLights.length; ++i){
      this._lights.push(GameObject.prototype.SerializeMap[this._unparsedLights[i]].getComponent('Light'));
    }
  }

  updateComponent(){}

  onRaycast(interactingObj) {
    let player = interactingObj.getComponent('PlayerController');
    if (player && player !== null) {
      for(let i =0; i < this._lights.length; ++i) {
        this._lights[i].setRange(0);
        // Debug.log("stopped light");
      }
    }
  }
}