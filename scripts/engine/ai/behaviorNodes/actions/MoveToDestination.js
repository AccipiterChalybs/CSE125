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
    console.log(this.ai.data["destination"]);
    if(this.ai.data["destination"]!==null) {
        let currPos = vec3.copy(vec3.create(), this.ai.transform.getPosition());
      let dest = vec3.copy(vec3.create(),       this.ai.data["destination"]);
        dest[0] *= -1;
        let newPos = Utility.vec3.moveTowards(currPos,dest, Time.deltaTime * this.moveSpeed);

      newPos[1] = currPos[1];
      this.ai.gameObject.getComponent('EvilController').moveToPosition(newPos);
      this.ai.transform.setPosition(newPos);
    }
    return this._currentState;
  }
}