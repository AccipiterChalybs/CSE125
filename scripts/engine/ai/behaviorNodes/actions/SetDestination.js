/**
 * Created by Stephen on 5/9/2017.
 */

class SetDestination extends BehaviorTreeLeaf{
  constructor(destToSet){
    super("ActionLeaf", "SetDestination");

    this._destinationToSet = destToSet;
  }

  updateNode(){
    BehaviorTreeNode.prototype.data["destination"] = this._destinationToSet;

    this._currentState = BehaviorTreeNode.success;
    return this._currentState;
  }
}