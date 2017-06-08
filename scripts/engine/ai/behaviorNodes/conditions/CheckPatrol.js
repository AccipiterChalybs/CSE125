/**
 * Created by austinsun on 6/7/17.
 */
class CheckPatrol extends BehaviorTreeLeaf{
    constructor(ai){
        super("Condition", "CheckPatrol", ai);
    }

    updateNode(){
        if(this.ai.data["patrol"]===true){
            this._currentState=BehaviorState.success;
        }
        else{
            this._currentState=BehaviorState.failure;
        }
        return this._currentState;
    }
}