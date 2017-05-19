/**
 * Created by Stephen on 5/9/2017.
 */

class ReturnTrue extends BehaviorTreeLeaf{
  constructor(){
    super("ActionLeaf", "ReturnTrue");
    this._currentState = BehaviorTreeNode.success;
  }

  updateNode(){
    return this._currentState;
  }
}