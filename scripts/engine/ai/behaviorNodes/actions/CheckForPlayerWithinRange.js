/**
 * Created by Stephen on 5/31/2017.
 */

class CheckForPlayerWithinRange extends BehaviorTreeLeaf{
  constructor(ai, range){
    super("ActionLeaf", "CheckForPlayerWithinRange", ai);

    this.range = range;
  }

  updateNode(){
    let closestPlayer = -1;
    let closestDist = Number.POSITIVE_INFINITY;
    for(let i = 0; i < PlayerTable.players.length; ++i){
      let dist = vec3.distance(PlayerTable.players[i].transform.getWorldPosition(), this.ai.transform.getWorldPosition());
      // Debug.log(dist);
      if(dist < closestDist){
        closestDist = dist;
        closestPlayer = i;
      }
    }

    if(closestDist < this.range){
      // Debug.log("Will be targeting: ", PlayerTable.players[closestPlayer]);
      this.ai.data["playerToTarget"] = PlayerTable.players[closestPlayer];
      this._currentState = BehaviorState.success;
    }else{
      this._currentState = BehaviorState.failure;
    }

    return this._currentState;
  }
}