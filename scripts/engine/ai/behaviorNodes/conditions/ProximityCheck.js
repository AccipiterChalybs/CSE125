/**
 * Created by Stephen on 4/25/2017.
 */

class ProximityCheck extends BehaviorTreeLeaf{
  constructor(ai, target, maxDistance){
    super("CondtionalLeaf", "ProximityCheck", ai);
    this.target = target;
    this.maxDistance = maxDistance;
  }

  updateNode(){
    let distance = vec3.distance(this.ai.transform.getPosition(), this.target);

    //console.log(distance);

    if(distance < this.maxDistance){
      this._currentState = BehaviorState.success;
    }else{
      this._currentState = BehaviorState.failure;
    }

    this.printDebugState();

    return this._currentState;
  }
}