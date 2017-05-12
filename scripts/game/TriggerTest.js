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
      this.gameObject.getComponent('AudioSource').setState(AudioState.play2dSound);
      let color = vec3.create();
      vec3.set(color, Math.random(), Math.random(), Math.random());
      this.gameObject.getComponent('Light').setColor(color);
      Debug.log("hit a player ", other);
    }else{
      Debug.log("hit something else ", other);
    }
  }

}