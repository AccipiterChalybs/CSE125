/**
 * Created by Stephen on 6/3/2017.
 */

class StopSingStatueEvent extends RaycastEvent{
  constructor(params = {singStatueEvents: []}) {
    super({});

    this._singStatueEvents = [];
    this._unparsedEvents = params.singStatueEvents;
  }

  start(){
    for(let i = 0; i < this._unparsedEvents.length; ++i){
      this._singStatueEvents.push(GameObject.prototype.SerializeMap[this._unparsedEvents[i]].getComponent('TriggerEvent'));
    }
  }

  updateComponent(){}

  onRaycast(interactingObj) {
    let player = interactingObj.getComponent('PlayerController');
    if (player && player !== null) {
      for(let i = 0; i < this._singStatueEvents.length; ++i){
        this._singStatueEvents[i].deactivate();
        Debug.log("stopping statue");
      }
    }
  }
}