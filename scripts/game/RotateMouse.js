/**
 * Created by Stephen on 4/15/2017.
 */

class RotateMouse extends Component{
  constructor(){
    super();
    this.componentType = "RotateMouse";
    this.sensitivity = 0.08;
  }

  update() {
    let dr = quat.create();
    let up = vec3.create(); vec3.set(up, 0, 1, 0);
    let rollAxis = vec3.create(); vec3.set(rollAxis, 1, 0, 0);
    quat.rotateY(dr, dr, Time.deltaTime * Input.getAxis('mouseHorizontal')
      * this.sensitivity * -1);
    quat.rotateX(dr, dr, Time.deltaTime * Input.getAxis('mouseVertical')
      * this.sensitivity * -1);
    this.transform.rotate(dr);
  }
}