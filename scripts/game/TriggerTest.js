/**
 * Created by Stephen on 4/28/2017.
 */

class TriggerTest extends Component{
  constructor(){
    super();
    this.componentType = "TriggerTest";

    this.player = null;
  }

  updateComponent(){
    if(this.player && this.player !== null){
      let myBody = this.transform.gameObject.getComponent("Collider").body;
      let playerBody = this.player.transform.gameObject.getComponent("Collider").body;
      if(this.player.mouseDown){
        console.log("\tcharging");
      }
    }
  }

  onTriggerEnter(other){
    let player = other.transform.gameObject.getComponent("PlayerController");
    if(player && player !== null) {
      console.log("hit a player ", other);
      this.player = player;
    }else{
      console.log("hit something else ", other);
    }
  }

}