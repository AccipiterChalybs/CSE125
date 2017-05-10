/**
 * Created by Stephen on 5/10/2017.
 */

class CountdownTimer extends BehaviorTreeLeaf{
  constructor(ai, timeToWait){
    super("Condition", "CountdownTimer", ai);

    this._started = false;
    this._finishTime = 0;
    this._timeToWait = timeToWait;
  }

  updateNode(){
    if(this._started === false){
      this._started = true;
      this._finishTime = Time.time + this._timeToWait;
    }

    if(this._finishTime <= Time.time){
      this._currentState = BehaviorState.success;
      this._started = false;
    }else{
      this._currentState = BehaviorState.failure;
    }

    return this._currentState;
  }
}