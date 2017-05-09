/**
 * Created by Stephen on 4/25/2017.
 */

const BehaviorState = {
  running: "running",
  success: "success",
  failure: "failure",
  standby: "standby"
};

class BehaviorTreeNode{
  constructor(nodeType = "UNDEFINED", name = "UNNAMED") {
    this.nodeType = nodeType;
    this.name = name;
    this._currentState =  BehaviorState.standby;
  }

  updateNode(){

  }

  toString(){
    return this.name + " (" + this.nodeType + ")";
  }

  printDebug(){
    console.log("Hi! (nodeType, name): (" + this.nodeType + ", " + this.name + ")" );
  }

  printDebugState(){
    if(Debug.behaviorTree.printAll || Debug.behaviorTree.printStates){
      console.log(this.toString() + ": " + this._currentState);
    }
  }

  printDebugDetailed(){

  }
}