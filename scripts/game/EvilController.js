/**
 * Created by Stephen on 4/25/2017.
 */

const EVIL_MOVEMENTSPEED = 20;

class EvilController extends AIController{
  constructor(){
    super();
    this.componentType = "EvilController";
    this.movementSpeed = EVIL_MOVEMENTSPEED;

    this._aiStates = {IDLE: "idle", CHASING: "chasing"};
    this._currentState = this._aiStates.IDLE;
  }

  start(){
    super.start();
  }

  updateComponent(){
    super.updateComponent();

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
    let root = new PrioritySelector("root");
    let sel0 = new ConcurrentSelector("to say hello");
    let proximityCheck = new ProximityCheck(this.transform, GameObject.prototype.SceneRoot.transform.children[1],60);
    let sayHello = new SayHello(this);

    sel0.addNode(proximityCheck);
    sel0.addNode(sayHello);

    let sayGoodbye = new SayGoodbye(this);

    //root.addNode(sel0);
    //root.addNode(sayGoodbye);
    return root;
  }
}