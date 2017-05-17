/**
 * Created by Stephen on 5/9/2017.
 */

class SetDestination extends BehaviorTreeLeaf{
  constructor(ai, destToSet){
    super("Action", "SetDestination", ai);

    this._destinationToSet = destToSet;
  }

  updateNode(){
    this.ai.setDestination(this._destinationToSet);

    this._currentState = BehaviorTreeNode.success;
    return this._currentState;
  }
}