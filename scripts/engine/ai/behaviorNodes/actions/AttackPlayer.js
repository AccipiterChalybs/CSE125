/**
 * Created by Stephen on 5/31/2017.
 */

class AttackPlayer extends BehaviorTreeLeaf{
  constructor(ai, cooldown){
    super("ActionLeaf", "AttackPlayer", ai);

    this.cooldown = cooldown;

    this._nextAttackTime = 0;

    // TODO: Delete me. This is for initial testing
    this.ai.data["player"] = PlayerTable.getPlayer();
  }

  updateNode(){
    this._currentState = BehaviorState.failure;

    if(this.ai.data["player"] !== null){
      if(this._nextAttackTime < Time.time) {
        this._nextAttackTime = Time.time + this.cooldown;
        this.ai.data["player"].getComponent("PlayerController").takeDamage();
        this._currentState = BehaviorState.success;
      }else{
        Debug.log("attack on cooldown!");
      }
    }

    return this._currentState;
  }
}