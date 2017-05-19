/**
 * Created by Stephen on 4/25/2017.
 */

/*
 * Visits all of its children during each traversal. Stops upon a child returning a failure.
 *
 * Can check through its list of conditions before it can execute an action.
 *
 * If the conditions all pass, then the state of this selector is the state of its
 * action node.
 */
class ConcurrentSelector extends BehaviorTreeNode{
  constructor(name = "UNNAMED"){
    super("ConcurrentSelector", name);
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

    for(let i = 0; i < this._children.length; ++i){
      this._currentState = this._children[i].updateNode();

      this.printDebugState();

      if(Debug.behaviorTree.printUniques || Debug.behaviorTree.printAll)
        console.log(this.toString() + " is at: " + this._children[i]);

      if(this._currentState === BehaviorState.failure){
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