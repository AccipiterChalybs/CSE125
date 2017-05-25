/**
 * Created by John Pallag on 4/15/2017.
 */

class RotateArrowKey extends Component {
    constructor({speed}) {
        super();
        this.componentType = "RotateOverTime";
        this.speed = speed;
    }

    update() {
        let dr = quat.create();
        let up = vec3.create(); vec3.set(up, 0, 1, 0);
        quat.setAxisAngle(dr, up, Time.deltaTime * this.speed * Input.getAxis('horizontal'));
        this.transform.rotate(dr);
    }
}
