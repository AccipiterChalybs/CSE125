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
      //console.log("moving");
      let up = vec3.create(); vec3.set(up, 0, 1, 0);

      let move = vec3.create();
      let moveX = vec3.create(); vec3.cross(moveX, Renderer.camera.transform.getForward(), up);
      let moveY = vec3.create(); vec3.cross(moveY, up, moveX);
      vec3.normalize(moveX, moveX);
      vec3.normalize(moveY, moveY);
      vec3.scale(moveX, moveX, x*this.movementSpeed);
      vec3.scale(moveY, moveY, y*this.movementSpeed);
      vec3.add(move, moveX, moveY);
      this.transform.translate(move);
    }
  }
}