/**
 * Created by Stephen on 5/10/2017.
 */

class SetDestinationPlayer extends BehaviorTreeLeaf{
  constructor(ai){
    super("Action", "SetDestinationPlayer", ai);
  }

  updateNode(){
    if(this.ai.data["player"] && this.ai.data["player"] !== null) {
      this.ai.setDestination(this.ai.data["player"].transform.getPosition());
      this._currentState = BehaviorTreeNode.success;
      // Debug.log(this.ai.data["player"].transform.getPosition());
    }else{
      this._currentState = BehaviorTreeNode.failure;
    }

    return this._currentState;
  }
}