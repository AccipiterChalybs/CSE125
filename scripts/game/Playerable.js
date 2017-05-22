/**
 * Created by ajermaky on 5/22/17.
 */
class Playerable extends Component{
  constructor({ lightColor=[3.6,12.1,2], lightRange, singingCooldown }) {
    super();
    this.componentType = "PlayerController";
    this.movementSpeed = REGULAR_SPEED;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.singing = 0;
    this.walking = 0;
    this.action = 0;
    this.forward = vec3.create(); vec3.set(this.forward, 0, 0, -1);

    this._collider = null;
    this._singer = null;
    this._singingSrc = null;
    this._nextSingTime = 0;
    this._lastSingInput = 0;
    this._pointLight = null;
    this._currentState = PlayerState.default;
    this._singingCooldown = singingCooldown;

    this.lightColor = lightColor;
    this.lightRange = lightRange;
  }

  start() {
    this.gameObject.addComponentToSerializeableList(this);
    this._collider = this.transform.gameObject.getComponent('Collider');
    this._singer = this.transform.gameObject.getComponent('Sing');
    this._pointLight = this.transform.gameObject.getComponent('Light');
    this._pointLight.setColor(this.lightColor);
    this._pointLight.setRange(this.lightRange);

    this._collider.setPhysicsMaterial(PhysicsEngine.materials.playerMaterial);
    this._collider.setFreezeRotation(true);
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
