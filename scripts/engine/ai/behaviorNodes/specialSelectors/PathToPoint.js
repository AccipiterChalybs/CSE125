/**
 * Created by Stephen on 5/8/2017.
 */

class PathToPoint extends SequenceSelector{
  constructor(ai, moveSpeed){
    super("PathToPoint");
    this.ai = ai;
    this.moveSpeed = moveSpeed;
  }

  handleNewPath(newPath){
    // Debug.log(newPath);
    this._children = [];

    for(let i = 0; i < newPath.length; ++i){
      let goToPt = new PrioritySelector("goToPt" + i);
      let proximityCheck = new ProximityCheck(this.ai, newPath[i], 0.1);
      let moveTo = new MoveToPoint(this.ai, newPath[i], this.moveSpeed);

      goToPt.addNode(proximityCheck);
      goToPt.addNode(moveTo);
      this._children.push(goToPt);
    }
  }
}