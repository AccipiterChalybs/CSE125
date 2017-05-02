/**
 * Created by Stephen on 5/2/2017.
 */

class Sing extends Component{
  constructor(range){
    super();
    this.componentType = "Sing";

    this.range = range;
  }

  start(){
    console.log(PhysicsEngine.sphereChecks);
  }

  updateComponent(){

  }

  sing(){
    Debug.log("singing");
    let hitColliders = [];
    hitColliders = PhysicsEngine.overlapSphere(this.transform.getPosition(), this.range);

    for(let i = 0; i < hitColliders.length; ++i){
      hitColliders[i].interact(this.transform.gameObject);
    }
  }
}