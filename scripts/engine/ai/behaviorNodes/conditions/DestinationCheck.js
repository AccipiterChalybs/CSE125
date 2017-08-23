/**
 * Created by Stephen on 5/9/2017.
 */

class DestinationCheck extends BehaviorTreeLeaf{
  constructor(ai, minDistance){
    super("CondtionalLeaf", "DestinationCheck", ai);

    this.minDistance = Number.EPSILON;
    if(minDistance !== undefined){
      this.minDistance = minDistance;
    }
  }

  updateNode(){
    let distance = vec3.distance(this.ai.transform.getPosition(), this.ai.data["destination"]);

    //console.log(distance);

    if(distance < this.minDistance){
      this._currentState = BehaviorState.success;
      this.ai.setDestination(null);
    }else{
      this._currentState = BehaviorState.failure;
    }

    this.printDebugState();

    return this._currentState;
  }
}