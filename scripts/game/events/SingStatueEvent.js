/**
 * Created by Stephen on 6/3/2017.
 */

class SingStatueEvent extends TriggerEvent{
  constructor(params = {delay: 0}) {
    super();

    this.activated = false;

    this._delay = params.delay;
    this._singer = null;
    this._timeToStart = Number.POSITIVE_INFINITY;
    this._deactivated = false;
  }

  start() {
    this._singer = this.transform.gameObject.getComponent('Sing');
  }

  updateComponent(){
    if(this.activated && Time.time >= this._timeToStart){
      this._singer.sing();
    }else{
      this._singer.quiet();
    }
  }

  deactivate(){
    this.activated = false;
    this._deactivated = true;
  }

  triggered(){
    if(!this.activated && !this._deactivated) {
      this.activated = true;
      this._timeToStart = Time.time + this._delay;
    }
  }
}
