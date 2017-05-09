/**
 * Created by Stephen on 5/8/2017.
 */

class PathToPoint extends SequenceSelector{
  constructor(ai, moveSpeed){
    super("PathToPoint");
    this.ai = ai;
    this.moveSpeed = moveSpeed;
  }

  createNewPath(newPath){
    this._children = [];

    for(let i = 0; i < newPath.length; ++i){
      let goToPt = new PrioritySelector("goToPt" + i);
      let proximityCheck = new ProximityCheck(this.ai, NavMesh.prototype.currentNavMesh.vertList[newPath[i]].pos, 0.1);
      let moveTo = new MoveToPoint(this.ai, NavMesh.prototype.currentNavMesh.vertList[newPath[i]].pos, this.moveSpeed);

      goToPt.addNode(proximityCheck);
      goToPt.addNode(moveTo);
      this._children.push(goToPt);
    }
  }
}