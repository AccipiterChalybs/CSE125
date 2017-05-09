/**
 * Created by Stephen on 5/9/2017.
 */

class FindPath extends BehaviorTreeLeaf{
  constructor(ai, toRecvPath){
    super("ActionLeaf", "FindPath", ai);

    this._toRecvPath = toRecvPath;
    this._destination = null;
    this._destinationDirty = true;
  }

  setDestination(newDest = [0,0,0]){
    this._destination = newDest;
    this._destinationDirty = true;
  }

  updateNode(){
    if(this._destinationDirty){
      this._destinationDirty = false;

      let path = [];
      let foundPath = NavMesh.prototype.currentNavMesh.findPath(this.ai.transform.getPosition(), this._destination, path);

      if(!foundPath) {
        this._currentState = BehaviorState.failure;
      }else{
        this._currentState = BehaviorState.success;
        this._toRecvPath.createNewPath(path);
      }
    }

    return this._currentState;
  }
}