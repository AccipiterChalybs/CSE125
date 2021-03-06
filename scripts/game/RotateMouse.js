/**
 * Created by Stephen on 4/15/2017.
 */

const MAX_LOOK_ANGLE_PITCH = (81)*Math.PI/180;

class RotateMouse extends Component{
  constructor(){
    super();
    this.componentType = "RotateMouse";
    this.xAngle = 0;
    this.yAngle = 0;
    this.sensitivity = 0.08;
  }

  updateClient() {
    let dr = quat.create();
    this.xAngle += Time.deltaTime * Input.getAxis('mouseVertical') * this.sensitivity * -1;
    this.yAngle += Time.deltaTime * Input.getAxis('mouseHorizontal') * this.sensitivity * -1;
    this.xAngle = (this.xAngle < MAX_LOOK_ANGLE_PITCH) ? this.xAngle : MAX_LOOK_ANGLE_PITCH;
    this.xAngle = (this.xAngle > -MAX_LOOK_ANGLE_PITCH) ? this.xAngle : -MAX_LOOK_ANGLE_PITCH;
    quat.rotateY(dr, dr, this.yAngle);
    quat.rotateX(dr, dr, this.xAngle);
    this.transform.setRotation(dr);
  }
}