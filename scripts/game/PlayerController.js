/**
 * Created by Stephen on 4/15/2017.
 */

class PlayerController extends Component{
  constructor(){
    super();
    this.componentType = "PlayerController";
    this.movementSpeed = 0.8;
  }

  update(){
    this.movement();
  }

  movement(){
    let x = Input.getAxis('horizontal');
    let y = Input.getAxis('vertical');

    if(x !== 0 || y !== 0) {
      console.log("moving");

      let move = vec3.create();
      vec3.set(move, x, y, 0);
      vec3.scale(move, move, this.movementSpeed);

      this.transform.translate(move);
    }
  }
}