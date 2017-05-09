/**
 * Created by Stephen on 4/25/2017.
 */

const EVIL_MOVEMENTSPEED = 5;

class EvilController extends AIController{
  constructor(){
    super();
    this.componentType = "EvilController";
    this.movementSpeed = EVIL_MOVEMENTSPEED;

    this.tmp_path = [];

    // this.lastFaceIndex = -1;
    // this.oldTeapot = [];
    // this.oldTeapot[0] = Debug.drawTeapot([0,0,0]);
    // this.oldTeapot[1] = Debug.drawTeapot([0,0,0]);
    // this.oldTeapot[2] = Debug.drawTeapot([0,0,0]);

    let pt0 = vec3.create(); vec3.set(pt0, -27, 0, -9);
    this.patrolPath = [[-27,0,-9],
      [-6.5, 0, -9],
      [-6.5, 0, 9],
      [0, 0, 9],
      [-6.5, 0, 9],
      [-6.5, 0, -5],
      [22, 0, -5],
      [22, 0, 15]];
  }

  start(){
    super.start();
  }

  updateComponent(){
    super.updateComponent();

    // NAVMESH
    // test/debugging zone


    // if(currFaceIndex !== this.lastFaceIndex && currFaceIndex !== -1){
    //   this.oldTeapot[0].removeComponent("Mesh");
    //   this.oldTeapot[1].removeComponent("Mesh");
    //   this.oldTeapot[2].removeComponent("Mesh");
    //   this.oldTeapot[0] = Debug.drawTeapot(this.navMesh.faceList[currFaceIndex].vert[0]);
    //   this.oldTeapot[1] = Debug.drawTeapot(this.navMesh.faceList[currFaceIndex].vert[1]);
    //   this.oldTeapot[2] = Debug.drawTeapot(this.navMesh.faceList[currFaceIndex].vert[2]);
    //   this.lastFaceIndex = currFaceIndex;
    // }
  }

  chase(){
    // Determine which triangle it's in and player
    // Do A*
    // Clean A* path
  }

  _buildBehaviorTree(){
    let root = new ConcurrentSelector("chase");

    let dest = vec3.fromValues(this.patrolPath[7][0], this.patrolPath[7][1], this.patrolPath[7][2]);
    let reachedDest = new Inverter(new ProximityCheck(this, dest, 0.1));
    let pathToPt = new PathToPoint(this, EVIL_MOVEMENTSPEED);
    let findPath = new FindPath(this, pathToPt);
    // determine dest
    findPath.setDestination(dest);

    // add determine dest
    root.addNode(findPath);
    root.addNode(reachedDest);
    root.addNode(pathToPt);

    //console.log(root);

    return root;
  }
}