/**
 * Created by Stephen on 4/26/2017.
 */

class MoveToPoint extends BehaviorTreeLeaf{
  constructor(ai, destination, moveSpeed){
    super("Action", "MoveToPoint", ai);
    this.destination = destination;
    this.moveSpeed = moveSpeed;

    this._currentState = BehaviorState.running;
  }

  updateNode(){
    let currPos = this.ai.transform.getPosition();
    let newPos = Utility.vec3.moveTowards(currPos, this.destination, Time.deltaTime * this.moveSpeed);
    this.ai.transform.setPosition(newPos);

    // console.log(this.ai);
    // console.log("currPos: ", currPos);
    // console.log("dest: ", this.destination);
    // console.log("newPos: ", newPos);
    // console.log("delta: ", Time.deltaTime * this.moveSpeed);
    //
    // throw new Error();

    return this._currentState;
  }
}