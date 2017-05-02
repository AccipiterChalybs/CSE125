/**
 * Created by Stephen on 4/28/2017.
 */

class TriggerTest extends Component{
  constructor(){
    super();
    this.componentType = "TriggerTest";
  }

  onTriggerEnter(other){
    let player = other.transform.gameObject.getComponent("PlayerController");
    if(player && player !== null) {
      Debug.log("hit a player ", other);
    }else{
      Debug.log("hit something else ", other);
    }
  }

}