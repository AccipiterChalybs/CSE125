/**
 * Created by Stephen on 4/15/2017.
 */

class PlayerController extends Component{
  constructor(){
    super();
    this.componentType = "PlayerController";
    this.movementSpeed = 30;
  }

  update(){
    this.movement();
  }

  movement(){
    let x = Input.getAxis('horizontal');
    let z = Input.getAxis('vertical');

    //if(x !== 0 || z !== 0) {
      //console.log("moving");
    let up = vec3.create(); vec3.set(up, 0, 1, 0);

    let move = vec3.create();
    let moveX = vec3.create(); vec3.cross(moveX, Renderer.camera.transform.getForward(), up);
    let moveZ = vec3.create(); vec3.cross(moveZ, up, moveX);
    vec3.normalize(moveX, moveX);
    vec3.normalize(moveZ, moveZ);
    vec3.scale(moveX, moveX, x*this.movementSpeed);
    vec3.scale(moveZ, moveZ, z* this.movementSpeed);
    vec3.add(move, moveX, moveZ);
    //this.transform.translate(move);

    //console.log(move);
    let boxBody = this.transform.gameObject.getComponent("BoxCollider").boxBody;
    // boxBody.position.set(move[0] + boxBody.position.x, boxBody.position.y, move[2] + boxBody.position.z);
    boxBody.velocity.x = move[0];
    boxBody.velocity.z = move[2];
    //}

    //let boxBody = this.transform.gameObject.getComponent("BoxCollider").boxBody;
    //console.log(boxBody.position);
  }
}