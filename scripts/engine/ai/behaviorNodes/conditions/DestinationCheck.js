/**
 * Created by Stephen on 5/9/2017.
 */

class DestinationCheck extends BehaviorTreeLeaf{
  constructor(ai){
    super("CondtionalLeaf", "DestinationCheck", ai);
  }

  updateNode(){
    let distance = vec3.distance(this.ai.transform.getPosition(), this.ai.data["destination"]);

    //console.log(distance);

    if(distance < Number.EPSILON){
      this._currentState = BehaviorState.success;
    }else{
      this._currentState = BehaviorState.failure;
    }

    this.printDebugState();

    return this._currentState;
  }
}