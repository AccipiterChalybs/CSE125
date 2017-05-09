/**
 * Created by Stephen on 5/9/2017.
 */

class Inverter extends BehaviorTreeNode{
  constructor(childNode){
    super("INVERTER", "Inverter");

    this.child = childNode;
  }

  updateNode(){
    let childState =  this.child.updateNode();

    switch(childState){
      case BehaviorState.success:
        this._currentState = BehaviorState.failure;
        break;
      case BehaviorState.failure:
        this._currentState = BehaviorState.success;
        break;
      default:
        this._currentState = childState;
        break;
    }

    return this._currentState;
  }
}