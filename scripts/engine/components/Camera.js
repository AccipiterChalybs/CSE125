/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */

class Camera extends Component {

    constructor () {
        this._shakeAmount=0;
        this._startShakeAmount=0;
        this._shakeDuration=0;
        this._startShakeDuration=0;

        this._isShaking=false;

        this._currentFOV=0;
        this._prevFOV=0;
        this._fovStartTime;

        this._forward = null;
        this._up = null;
        this._position = null;
        this._prevPosition = null;
        this._velocity=null;

        this._matrix = null;


        this.offset = null;
        this.fov = 0;
        this.fovDuration = 0;
    }

    getCameraMatrix() {

    }

    update() {

    }

    screenShake(amount, duration) {

    }

    getForward() {

    }

    getVelocity() {

    }

    getFOV() {

    }

}