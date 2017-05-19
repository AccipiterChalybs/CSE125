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
      // if(!IS_SERVER){
      //   let soundid = SoundEngine.playSound2d(SoundEngine.you_won);
      //   alert("CONGRATULATIONS! You won an iPhone press any button to confirm");
      //   SoundEngine.pauseSound(soundid[0], soundid[1]);
      // }
      Debug.log("hit a player ", other);
    }else{
      Debug.log("hit something else ", other);
    }
  }

}