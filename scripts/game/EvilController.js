/**
 * Created by Stephen on 4/25/2017.
 */

const EVIL_MOVEMENTSPEED = 20;

class EvilController extends Component{
  constructor(){
    super();
    this.componentType = "EvilController";
    this.movementSpeed = MOVEMENTSPEED;

    this._aiStates = {IDLE: "idle", CHASING: "chasing"};
    this._currentState = this._aiStates.IDLE;
  }

  updateComponent(){
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
}