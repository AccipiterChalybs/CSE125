/**
 * Created by Stephen on 6/5/2017.
 */
const TriggerEventState = {
  trigger: 0,
  untrigger: 1,
  rest: 2,
};

class PlayAudioEvent extends TriggerEvent{
  constructor(params = {delay: 0, volume: 1, rate: 1}) {
    super();

    this.activated = false;

    this._delay = params.delay;
    this._volume = params.volume;
    this._rate = params.rate;
    this._audioSrc = null;
    this._triggerClient=false;

    this.serializeDirty=true;
    this.state = TriggerEventState.rest;
  }

  start() {
    this.gameObject.addComponentToSerializeableList(this);

  }

  startClient(){
    this.gameObject.addComponentToSerializeableList(this);

    this._audioSrc = this.transform.gameObject.getComponent('AudioSource');
    if(this._audioSrc && this._audioSrc !== null) {
      this._audioSrc.changeVolume(this._volume);
      this._audioSrc.setRate(this._rate);
    }else{
      Debug.log("PlayAudioEvent is missing an audio source!! ", this);
    }
  }

  updateComponent() {
    switch (this.state){
      case TriggerEventState.trigger:
        this._triggerClient=true;
        this.setState(TriggerEventState.untrigger);
        break;
      case TriggerEventState.untrigger:
        this._triggerClient=false;
        this.setState(TriggerEventState.rest);
        break;
    }
  }
  updateComponentClient(){
    if(this.activated && Time.time >= this._timeToStart ) {
      if(this._audioSrc && this._audioSrc !== null) {
        this._audioSrc.playSound();
      }
    }
  }

  deactivate(){
    this.activated = false;
    this._deactivated = true;
  }

  triggered(){
    this._triggerClient=true;
    this.serializeDirty = true;
    if(Debug.clientUpdate){
      this.triggeredClient();
    }
  }
  triggeredClient(){
    if(!this.activated && !this._deactivated) {
      this.activated = true;
      this._timeToStart = Time.time + this._delay;
    }
  }

  serialize(){
    if(this.serializeDirty) {
      let data = {};
      data.t = this._triggerClient;
      this.serializeDirty = false;
      return data;
    }
    return null;

  }

  applySerializedData(data){
    if(!!data.t){
      this.triggeredClient();
    }
  }

  setState(state){
    this.state = state;
    this.serializeDirty = true;
  }
}
