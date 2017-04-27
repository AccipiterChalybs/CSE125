/**
 * Created by Stephen on 4/25/2017.
 */

class SayHello extends BehaviorTreeLeaf{
  constructor(ai){
    super("ActionLeaf", "SayHello", ai);
  }

  updateNode(){
    console.log("Hello!");
    this._currentState = BehaviorState.success;
    return this._currentState;
  }
}