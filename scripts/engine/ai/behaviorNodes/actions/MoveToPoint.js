/**
 * Created by Stephen on 4/26/2017.
 */

class MoveToPoint extends BehaviorTreeLeaf{
  constructor(ai, destination, moveSpeed){
    super("BehaviorTreeLeaf", "MoveToPoint", ai);
    this.destination = destination;
    this.moveSpeed = moveSpeed;
  }

  updateNode(){
    let currPos = this.ai.transform.getPosition();
    let newPos = vec3.create(); vec3.subtract(newPos, this.destination, currPos);
    this.ai.transform.translate(vec3.scale(newPos, vec3.normalize(newPos, newPos), Time.deltaTime * this.moveSpeed));
    this._currentState = BehaviorState.running;

    // console.log(this.ai);
    // console.log("currPos: ", currPos);
    // console.log("dest: ", this.destination);
    // console.log("newPos: ", newPos);
    // console.log("maths: ", vec3.scale(newPos, vec3.normalize(newPos, newPos), Time.deltaTime * this.moveSpeed));
    //
    // throw new Error();

    return this._currentState;
  }
}