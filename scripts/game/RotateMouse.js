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
    console.log(Input.getAxis('mouseHorizontal'));
    quat.rotateY(dr, dr, Time.deltaTime * Input.getAxis('mouseHorizontal')
      * this.sensitivity * -1);
    quat.rotateX(dr, dr, Time.deltaTime * Input.getAxis('mouseVertical')
      * this.sensitivity * -1);
    this.transform.rotate(dr);
  }
}