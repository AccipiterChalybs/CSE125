/**
 * Created by ajermaky on 5/22/17.
 */
class SingingStatueController extends Component{
  constructor(params = {singingDelay: 0, singingDuration: 3}) {
    super();
    this.componentType = 'StatueController';

    this._maxSingingDuration = params.singingDuration;
    this._singingDelay = params.singingDelay;
    this._currentSingingDuration = 0;
    this._nextSingTime = 0;
    this._singer = null;
  }

  start() {
    this._singer = this.transform.gameObject.getComponent('Sing');
  }

  updateComponent() {
    if(this._maxSingingDuration === 0 && this._singingDelay === 0){
      this._singer.sing();
    }else {
      if (Time.time >= this._nextSingTime && this._currentSingingDuration < this._maxSingingDuration) {
        this._singer.sing();
        this._currentSingingDuration += Time.deltaTime;
      } else if (this._currentSingingDuration >= this._maxSingingDuration) {
        this._singer.quiet();
        this._currentSingingDuration = 0;
        this._nextSingTime = Time.time + this._singingDelay + this._maxSingingDuration;
      } else {
        this._singer.quiet();
      }
    }
  }
}
