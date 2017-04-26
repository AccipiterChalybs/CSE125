/**
 * Created by Stephen on 4/25/2017.
 */

class SayGoodbye extends BehaviorTreeLeaf{
  constructor(ai){
    super("BehaviorTreeLeaf", "SayGoodbye", ai);
  }

  updateNode(){
    console.log("Goodbye. =[");
    this._currentState = BehaviorState.success;
    return this._currentState;
  }
}