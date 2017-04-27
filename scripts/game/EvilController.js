/**
 * Created by Stephen on 4/25/2017.
 */

const EVIL_MOVEMENTSPEED = 5;

class EvilController extends AIController{
  constructor(navMesh){
    super();
    this.componentType = "EvilController";
    this.movementSpeed = EVIL_MOVEMENTSPEED;

    // TODO Extract later
    this.navMesh = navMesh;
    this.lastFaceIndex = -1;
    this.oldTeapot = [];
    this.oldTeapot[0] = Debug.drawTeapot([0,0,0]);
    this.oldTeapot[1] = Debug.drawTeapot([0,0,0]);
    this.oldTeapot[2] = Debug.drawTeapot([0,0,0]);

    let pt0 = vec3.create(); vec3.set(pt0, -27, 0, -9);
    this.patrolPath = [[-27,0,-9],
      [-6.5, 0, -9],
      [-6.5, 0, 9],
      [0, 0, 9],
      [-6.5, 0, 9],
      [-6.5, 0, -5],
      [22, 0, -5],
      [22, 0, 15]];

    this._aiStates = {IDLE: "idle", CHASING: "chasing"};
    this._currentState = this._aiStates.IDLE;
  }

  start(){
    super.start();
  }

  updateComponent(){
    super.updateComponent();

    let currFaceIndex = this.navMesh.findFace(this.transform.getPosition());

    if(currFaceIndex !== this.lastFaceIndex){
      this.oldTeapot[0].removeComponent("Mesh");
      this.oldTeapot[1].removeComponent("Mesh");
      this.oldTeapot[2].removeComponent("Mesh");
      this.oldTeapot[0] = Debug.drawTeapot(this.navMesh.faceList[currFaceIndex].vert[0]);
      this.oldTeapot[1] = Debug.drawTeapot(this.navMesh.faceList[currFaceIndex].vert[1]);
      this.oldTeapot[2] = Debug.drawTeapot(this.navMesh.faceList[currFaceIndex].vert[2]);
      this.lastFaceIndex = currFaceIndex;
      console.log("heeey.");
    }


    if(this._currentState === this._aiStates.IDLE) {
      this.chase();
    }
  }

  chase(){
    this._currentState = this._aiStates.CHASING;
    // Determine which triangle it's in and player
    // Do A*
    // Clean A* path
  }

  _buildBehaviorTree(){
    //console.log(this);
    let root = new SequenceSelector("root");

    for(let i = 0; i < this.patrolPath.length; ++i){
      let goToPt = new PrioritySelector("goToPt" + i);
      let proximityCheck = new ProximityCheck(this, this.patrolPath[i], 0.1);
      let moveTo = new MoveToPoint(this, this.patrolPath[i], EVIL_MOVEMENTSPEED);

      goToPt.addNode(proximityCheck);
      goToPt.addNode(moveTo);
      root.addNode(goToPt);
    }

    //console.log(root);

    return root;
  }
}