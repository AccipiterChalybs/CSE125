/**
 * Created by Stephen on 5/31/2017.
 */

class TargetPlayer extends BehaviorTreeLeaf{
  constructor(ai){
    super("ActionLeaf", "TargetPlayer", ai);

    this.ai.data["playerToTarget"] = PlayerTable.getPlayer();
  }

  updateNode(){
    if(this.ai.data["playerToTarget"] === null){
      this._currentState = BehaviorState.failure;
    }else if(this.ai.data["playerToTarget"] !== this.ai.data["player"]){
      this._currentState = BehaviorState.success;

      Debug.log("Targeting... ", this.ai.data["playerToTarget"]);
      this.ai.setPlayer(this.ai.data["playerToTarget"]);
      PlayerTable.resetHate();
      PlayerTable.increaseHate(PlayerTable.getPlayerID(this.ai.data["playerToTarget"]), TARGET_PLAYER_INITIAL_HATE);
    }

    return this._currentState;
  }
}