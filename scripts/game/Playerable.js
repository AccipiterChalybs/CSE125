/**
 * Created by ajermaky on 5/22/17.
 */
class Playerable extends Component{
  constructor(params = {singingCooldown: COOLDOWN_SINGING}) {
    super();
    this.componentType = "PlayerController";
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.singing = 0;
    this.walking = 0;
    this.action = 0;

    this._colliders = [];
    this._singer = null;
    this._singingSrc = null;
    this._nextSingTime = 0;
    this._lastSingInput = 0;
    this._currentState = PlayerState.default;
    this._singingCooldown = params.singingCooldown;
  }

  start() {
    this.gameObject.addComponentToSerializeableList(this);
    this.transform.gameObject.findComponents('Collider', this._colliders);
    this._singer = this.transform.gameObject.getComponent('Sing');

    for(let i = 0; i < this._colliders.length; ++i) {
      this._colliders[i].setPhysicsMaterial(PhysicsEngine.materials.playerMaterial);
      this._colliders[i].setFreezeRotation(true);
    }
  }

  startClient() {
    this.gameObject.addComponentToSerializeableList(this);
    this._singingSrc = this.transform.gameObject.getComponent('AudioSource');
  }

  updateComponentClient() {

  }

  updateComponent() {
  }

  movement() {

  }

  sing(){
    // console.log("singing!");
  }

  getCurrentState(){
    return this._currentState;
  }

  setCurrentState(newState){
    this._currentState = newState;
  }

  serialize() {
    let data = {};
    data.a = this.action;
    data.s = this.singing;
    data.st = this._nextSingTime;

    return data;
  }

  applySerializedData(data) {
    // Debug.log(this);
    this.action = data.a;
    this.singing = data.s;
    this._nextSingTime = data.st;

  }
}
