/**
 * Created by austinsun on 6/6/17.
 */

class RayCastPlayer extends BehaviorTreeLeaf{
    constructor(ai){
        super("Action", "RayCastPlayer", ai);

        this._currentState = BehaviorState.success;
    }

    updateNode(){
        let player=this.ai.getPlayer();
        let playerPos=vec3.create(); vec3.copy(playerPos, player.transform.getWorldPosition());
        let currPos = vec3.create(); vec3.copy(currPos, this.ai.transform.getWorldPosition());
        currPos[1]+=0.5;
        playerPos[1]=currPos[1];
        //console.log("ai:",this.ai);
        //console.log("player pos",playerPos);
        //console.log("enemyPos: ",currPos);
        let dist = vec3.distance(playerPos, currPos);
        let sub = vec3.create(); vec3.subtract(sub,playerPos,currPos);
        let hit={};
        if (PhysicsEngine.raycastClosest(currPos,sub , dist, 63 - FILTER_TRIGGER-FILTER_DEFAULT-FILTER_PLAYER, hit))
        {
            //console.log("hello world");
            this._currentState=BehaviorState.failure;
            //this.ai.data['destination'] = null;
            //console.log("Not Found");
        }
        else {
            this._currentState = BehaviorState.success
        }
        return this._currentState;
    }
}