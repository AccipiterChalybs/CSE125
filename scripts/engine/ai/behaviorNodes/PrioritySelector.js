/**
 * Created by Stephen on 4/25/2017.
 */

/*
 * Goes through its list of actions to find an action it can perform on each update.
 * Will always start from the first action in the list of actions.
 */
class PrioritySelector extends BehaviorTreeNode{
  constructor(name = "UNNAMED"){
    super("PrioritySelector", name);
    this._children = [];
  }

  addNode(newNode){
    this._children.push(newNode);
  }

  updateNode(){
    if(this._children.length === 0){
      if(Debug.behaviorTree.printErrors || Debug.behaviorTree.printAll)
        console.log(this.toString() + " is empty! Are you sure it should be empty?");

      return BehaviorState.success;
    }

    for(let i = 0; i < this._children.length; ++i) {
      this._currentState = this._children[i].updateNode();

      this.printDebugState();

      if(Debug.behaviorTree.printUniques || Debug.behaviorTree.printAll)
        console.log(this.toString() + " is at: " + this._children[i]);

      switch (this._currentState) {
        case BehaviorState.running:
          return this._currentState;
        case BehaviorState.success:
          if(Debug.behaviorTree.printSuccesses || Debug.behaviorTree.printAll)
            console.log(this.toString() + " succeeded.");
          return this._currentState;
        case BehaviorState.failure:
          if(Debug.behaviorTree.printFailures || Debug.behaviorTree.printAll)
            console.log(this.toString() + " failed.");
          break;
        default:
          break;
      }
    }

    return this._currentState;
  }

  printDebugDetailed(){
    this.printDebug();
    console.log("These are my children: ", this._children);
  }
}