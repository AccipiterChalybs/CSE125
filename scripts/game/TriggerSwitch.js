/**
 * Created by Stephen on 6/2/2017.
 */

class TriggerSwitch extends Component{
  constructor(params = {events: []}){
    super();
    this.componentType = 'TriggerSwitch';

    this._events = [];
    this._unparsedEvents = params.events;
  }

  start() {
    for(let i = 0; i < this._unparsedEvents.length; ++i){
      this._events.push(GameObject.prototype.SerializeMap[this._unparsedEvents[i]].getComponent("TriggerEvent"));
    }
  }

  updateComponent(){

  }

  onTriggerEnter(other){
    let player = other.transform.gameObject.getComponent("PlayerController");
    if(player && player !== null) {
      // Debug.log("hit a player "/*, other*/);
      for(let i = 0; i < this._events.length; ++i){
        this._events[i].triggered();
      }
    }else{
      // Debug.log("hit something else "/*, other*/);
    }
  }
}