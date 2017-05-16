/**
 * Created by Stephen on 4/25/2017.
 */

/*
 * On one update, checks if the next action can be run. If the action cannot be performed or fails,
 * this selector resets and returns a failure.
 *
 * The state of this node is the state of its current child
 */
class SequenceSelector extends BehaviorTreeNode{
  constructor(name = "UNNAMED"){
    super("SequenceSelector", name);
    this._children = [];
    this._currentChild = 0;
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

    if(Debug.behaviorTree.printUniques || Debug.behaviorTree.printAll)
      console.log(this.toString() + " is at: " + this._children[this._currentChild]);

    this._currentState = this._children[this._currentChild].updateNode();

    switch(this._currentState){
      case BehaviorState.running:
        break;
      case BehaviorState.success:
        if(Debug.behaviorTree.printSuccesses || Debug.behaviorTree.printAll)
          console.log(this.toString() + " succeeded.");

        this._currentChild++;

        if(this._currentChild >= this._children.length)
          this.reset();

        break;
      case BehaviorState.failure:
        if(Debug.behaviorTree.printFailures || Debug.behaviorTree.printAll)
          console.log(this.toString() + " failed.");

        this.reset();
        break;
      default:
        break;
    }

    this.printDebugState();

    return this._currentState;
  }

  reset(){
    this._currentChild = 0;

    if(Debug.behaviorTree.printUniques || Debug.behaviorTree.printAll)
      console.log(this.toString() + " reset!");
  }

  printDebugDetailed(){
    this.printDebug();
    console.log("These are my children: ", this._children);
  }
}