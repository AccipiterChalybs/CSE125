/**
 * Created by Stephen on 4/28/2017.
 */

class TriggerTest extends Component{
  constructor(){
    super();
  }

  updateComponent(){
  }

  onTriggerEnter(other){
    let player = other.transform.gameObject.getComponent("PlayerController");
    if(player && player !== null) {
      // console.log("hit a player", other);
      if(player.mouseDown){
        // Debug.log("\tcharging");
      }
    }else{
      // console.log("hit something else ", other);
    }
  }

}