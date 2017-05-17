/**
 * Created by Stephen on 5/10/2017.
 */

class PickRandomPlayer extends BehaviorTreeLeaf{
  constructor(ai){
    super("Action", "PickRandomPlayer", ai);

    this._currentState = BehaviorState.success;
  }

  updateNode(){
    let randPlayerNum = Utility.randomIntFromInterval(0, 3);

    this.ai.setPlayer(PlayerTable.players[randPlayerNum]);

    // Debug.log(PlayerTable.players[randPlayerNum]);
    return this._currentState;
  }
}