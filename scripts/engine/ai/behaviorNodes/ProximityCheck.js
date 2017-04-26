/**
 * Created by Stephen on 4/25/2017.
 */

class ProximityCheck extends BehaviorTreeLeaf{
  constructor(ai, target, maxDistance){
    super("BehaviorTreeLeaf", "ProximityCheck", ai);
    this.target = target;
    this.maxDistance = maxDistance;

    this._debug = false;
  }

  updateNode(){
    let distance = vec3.distance(this.ai.position, this.target.position);

    if(this._debug){
      //console.log(this.ai.position);
      //console.log(this.target.position);
      console.log("current distance away: " + distance);
    }

    if(distance < this.maxDistance){
      this._currentState = BehaviorState.success;
    }else{
      this._currentState = BehaviorState.failure;
    }

    this.printDebugState();

    return this._currentState;
  }
}