class CheckDestination extends BehaviorTreeLeaf{
    constructor(ai){
        super("Condition", "CheckDestination", ai);
    }

    updateNode(){
        if(this.ai.data['destination']==null){
            this._currentState=BehaviorState.failure;
            let tempAI = this.ai;
            setTimeout(function () {
                tempAI.data['patrol']=true;
            },3000);
        }
        else{
            this._currentState=BehaviorState.success;
            this.ai.data['patrol']=false;
        }
        return this._currentState;
    }
}