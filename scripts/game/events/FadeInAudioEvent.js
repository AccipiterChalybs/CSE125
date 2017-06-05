/**
 * Created by Stephen on 6/5/2017.
 */

class FadeInAudioEvent extends TriggerEvent{
  constructor(params = {delay: 0, fadeTime: 1, volume: 1, rate: 1}) {
    super();

    this.activated = false;

    this._delay = params.delay;
    this._fadeTime = params.fadeTime;
    this._volume = params.volume;
    this._rate = params.rate;
    this._audioSrc = null;

    this._currentVolume = 0;
    this._startVolume = 0;
    this._endTime = 0;
    this._triggerClient=false;
  }

  start() {
    this.gameObject.addComponentToSerializeableList(this);
  }

  startClient(){
    this.gameObject.addComponentToSerializeableList(this);
    this._audioSrc = this.transform.gameObject.getComponent('AudioSource');
    if(this._audioSrc && this._audioSrc !== null) {
      this._audioSrc.changeVolume(this._startVolume);
      this._audioSrc.setRate(this._rate);
    }else{
      Debug.log("PlayAudioEvent is missing an audio source!! ", this);
    }
  }

  updateComponent(){
  }

  updateComponentClient(){
    if(this.activated && Time.time >= this._timeToStart ) {
      if(this._audioSrc && this._audioSrc !== null) {
        // Debug.log(this._currentVolume);
        this._currentVolume = Utility.lerp(this._startVolume, this._volume, 1 - (this._endTime - Time.time) / this._fadeTime);
        this._audioSrc.changeVolume(this._currentVolume);
        this._audioSrc.playSound();
      }
    }
  }

  deactivate(){
    this.activated = false;
    this._deactivated = true;
  }

  triggered(){
    this._triggerClient = true;
  }

  triggeredClient(){
    if(!this.activated && !this._deactivated) {
      this.activated = true;
      this._timeToStart = Time.time + this._delay;
      this._endTime = Time.time + this._fadeTime + this._delay;
    }
  }

  serialize(){
    let data = {};
    data.t = this._triggerClient;
    this._triggerClient = false;
    return data;

  }

  applySerializedData(data){
    if(!!data.t){
      this.triggeredClient();
    }
  }
}
