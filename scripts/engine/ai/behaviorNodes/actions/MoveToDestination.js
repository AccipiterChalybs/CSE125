/**
 * Created by Stephen on 5/31/2017.
 */

class MoveToDestination extends BehaviorTreeLeaf{
  constructor(ai, moveSpeed){
    super("Action", "MoveToDestination", ai);
    this.moveSpeed = moveSpeed;

    this._currentState = BehaviorState.running;
  }

  updateNode(){
    if(this.ai.data["destination"]!==null) {
        let currPos = this.ai.transform.getPosition();
        let newPos = Utility.vec3.moveTowards(currPos, this.ai.data["destination"], Time.deltaTime * this.moveSpeed);
        this.ai.transform.setPosition(newPos);
        // console.log(this.ai);
        // console.log("currPos: ", currPos);
        // console.log("dest: ", this.ai.data["destination"]);
        // console.log("newPos: ", newPos);
        // console.log("delta: ", Time.deltaTime * this.moveSpeed);
        //
        // throw new Error();
    }
    return this._currentState;
  }
}