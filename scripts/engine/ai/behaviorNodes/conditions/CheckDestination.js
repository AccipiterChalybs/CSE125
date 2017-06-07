class CheckDestination extends BehaviorTreeLeaf{
    constructor(ai){
        super("Condition", "CheckDestination", ai);
    }

    updateNode(){
        console.log("Check Destination");
        if(this.ai.data['destination']==null){
            this._currentState=BehaviorState.failure;
            console.log("failure");
        }
        else{
            this._currentState=BehaviorState.success;
        }
        return this._currentState;
    }
}