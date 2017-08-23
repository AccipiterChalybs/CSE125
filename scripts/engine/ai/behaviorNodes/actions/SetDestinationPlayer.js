/**
 * Created by Stephen on 5/10/2017.
 */

class SetDestinationPlayer extends BehaviorTreeLeaf{
  constructor(ai){
    super("Action", "SetDestinationPlayer", ai);
  }

  updateNode(){
    if(this.ai.data["player"] && this.ai.data["player"] !== null) {
      let playerPos = vec3.create(); vec3.copy(playerPos, this.ai.data["player"].transform.getWorldPosition());
      this.ai.setDestination(playerPos);
      this._currentState = BehaviorTreeNode.success;
      //Debug.log(this.ai.data["player"].transform.getPosition());
    }else{
      this._currentState = BehaviorTreeNode.failure;
    }

    return this._currentState;
  }
}