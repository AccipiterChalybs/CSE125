/**
 * Created by Stephen on 6/5/2017.
 */

class PlayAudio extends Component{
  constructor({volume, rate}){
    super();

    this._volume = volume;
    this._rate = rate;
    this._audioSrc = null;
  }

  startClient(){
    this._audioSrc = this.transform.gameObject.getComponent('AudioSource');
    if(this._audioSrc && this._audioSrc !== null) {
      this._audioSrc.changeVolume(this._volume);
      this._audioSrc.setRate(this._rate);
    }else{
      Debug.log("PlayAudio is missing an audio source!! ", this);
    }
  }

  updateComponentClient(){
    if(this._audioSrc && this._audioSrc !== null) {
      this._audioSrc.playSound();
    }
  }
}