/**
 * Created by Stephen on 5/2/2017.
 */

const MAX_LIGHT_RANGE = 8;
const MIN_LIGHT_RANGE = 1;
const LIGHT_EXPAND_RATE = 15;
const LIGHT_DIMINISH_RATE = 5;
const LIGHT_INTENSITY_SCALE = 10;

class Sing extends Component{
  constructor(params = {range: 2, light: -1}){
  super();
  this.componentType = "Sing";

    this.range = params.range;

    this._pointLight = null;
    this._lightIndex = params.light;
  }

  start(){
    this._pointLight = GameObject.prototype.SerializeMap[this._lightIndex].getComponent("Light");
    if(this._pointLight && this._pointLight !== null)
      this._pointLight.setColor(vec3.scale(vec3.create(), this._pointLight.color, LIGHT_INTENSITY_SCALE));
    //console.log(PhysicsEngine.sphereChecks);
  }

  updateComponent(){
  }

  sing(){
    // Debug.log("singing with range: ", this.range);
    if(this._pointLight !== null && this._pointLight)
      this._pointLight.setRange(Utility.moveTowards(this._pointLight.range,MAX_LIGHT_RANGE,LIGHT_EXPAND_RATE*Time.deltaTime));

    let hitColliders = PhysicsEngine.overlapSphere(this.transform.getWorldPosition(), this.range);

    for(let i = 0; i < hitColliders.length; ++i){
      hitColliders[i].listen(this.transform.gameObject);
    }
  }

  quiet(){
    // Debug.log("i am quiet");
    if(this._pointLight !== null && this._pointLight)
      this._pointLight.setRange(Utility.moveTowards(this._pointLight.range,MIN_LIGHT_RANGE,LIGHT_DIMINISH_RATE*Time.deltaTime));
  }
}