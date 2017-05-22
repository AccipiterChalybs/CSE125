/**
 * Created by ajermaky on 5/22/17.
 */
class StatueController extends Playerable{
  constructor({ lightColor, lightRange, singingCooldown }) {
    super({ lightColor, lightRange, singingCooldown });
  }

  start() {
    super.start();
    this.transform.gameObject.getComponent('Collider').setLayer(FILTER_KINEMATIC);
    this._maxSingingDuration = 3;
    this._currentSingingDuration = 0;
  }

  startClient() {
    super.startClient();
  }

  updateComponent() {
    if (this.singing === 0 && this._lastSingInput === 1) {
      this._nextSingTime = Time.time + this._singingCooldown;
      // if(!IS_SERVER) this._singingSrc.pauseSound();
    }

    this._lastSingInput = this.singing;

    if (Time.time >= this._nextSingTime && this._currentSingingDuration < this._maxSingingDuration) {
      this.singing = 1;
      this._currentState = PlayerState.singing;
      this._currentSingingDuration += Time.deltaTime;
      //if !injured
      this._singer.sing();
    } else {
      this._currentSingingDuration = 0;
      this.singing = 0;
      this._currentState = PlayerState.default;
    }

    if (this._currentState === PlayerState.singing) {
      this._pointLight.setRange(Utility.moveTowards(this._pointLight.range, MAX_LIGHT_RANGE, LIGHT_EXPAND_RATE * Time.deltaTime));
    }else {
      this._pointLight.setRange(Utility.moveTowards(this._pointLight.range, MIN_LIGHT_RANGE, LIGHT_DIMINISH_RATE * Time.deltaTime));
    }
  }

  updateComponentClient() {
    if (this.singing === 1 && Time.time >= this._nextSingTime) {
      this._singingSrc.resumeSound();
    }else {
      this._singingSrc.pauseSound();
    }
  }

  movement() {}

  serialize() {
    let data = super.serialize();
    return data;
  }

  applySerializedData(data) {
    // Debug.log(this);
    super.applySerializedData(data);
  }
}
