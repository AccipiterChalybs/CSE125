class CheckDestination extends BehaviorTreeLeaf{
    constructor(ai){
        super("Condition", "CheckDestination", ai);
    }

    updateNode(){
        if(this.ai.data['destination']==null){
            this._currentState=BehaviorState.failure;
        }
        else{
            this._currentState=BehaviorState.success;
        }
        return this._currentState;
    }
}