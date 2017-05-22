/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */

class Camera extends Component
{

    constructor ()
    {
        super();
        this.componentType = "Camera";

        if (Renderer.camera === null) {
            Renderer.camera = this;
        } else {
            console.error("Camera already exists!");
        }

        this._shakeAmount=0;
        this._startShakeAmount=0;
        this._shakeDuration=0;
        this._startShakeDuration=0;

        this._isShaking=false;

        this._currentFOV = this.fov = Math.atan(1.0) * 4.0 / 3.0;
        this._prevFOV=0;
        this._fovStartTime=null;

        this._forward = null;
        this._up = vec3.create();
        vec3.set(this._up, 0, 1, 0);
        this._position = null;
        this._prevPosition = null;
        this._velocity=null;

        this._matrix = mat4.create();
        this._zoom = null;

        let initialOffsetPos = vec3.create();
        vec3.set(initialOffsetPos, 0, 0, 0);
        this.offset = new Transform();
        //TODO re-enable: this.offset.position = initalOffsetPos;
        this.fovDuration = 1;
    }

    startClient(){
      this._zoom = this.transform.gameObject.getComponent("ZoomMouse");

    }
    getCameraMatrix()
    {
        /*mat4.multiply(this._matrix,
            this.gameObject.transform.getTransformMatrix(), this.offset.getTransformMatrix());*/
        this._matrix = this.gameObject.transform.getTransformMatrix();
        let scale = vec3.create();
        let tmpMatrixRow = vec3.create();
        /*
        //TODO could definitely be wrong on this ordering (used to be [a][b])
        vec3.set(tmpMatrixRow, this._matrix[0], this._matrix[1], this._matrix[2]);
        scale[0] = 1 / vec3.length(tmpMatrixRow);
        vec3.set(tmpMatrixRow, this._matrix[4], this._matrix[5], this._matrix[6]);
        scale[1] = 1 / vec3.length(tmpMatrixRow);
        vec3.set(tmpMatrixRow, this._matrix[8], this._matrix[9], this._matrix[10]);
        scale[2] = 1 / vec3.length(tmpMatrixRow);
        console.log(scale);*/


        vec3.set(tmpMatrixRow, this._matrix[0], this._matrix[4], this._matrix[8]);
        scale[0] = 1 / vec3.length(tmpMatrixRow);
        vec3.set(tmpMatrixRow, this._matrix[1], this._matrix[5], this._matrix[9]);
        scale[1] = 1 / vec3.length(tmpMatrixRow);
        vec3.set(tmpMatrixRow, this._matrix[2], this._matrix[6], this._matrix[10]);
        scale[2] = 1 / vec3.length(tmpMatrixRow);
        //console.log(scale);

        let camScaledMatrix = mat4.create();
        mat4.scale(camScaledMatrix, this._matrix, scale);

        let dummy = mat4.create();
        return mat4.invert(dummy, camScaledMatrix);
    }


    updateComponent()
    {
        /* TODO update this
        if(this.fov !== this._prevFOV)
        {
            // this._fovStartTime = Timer::time();
            this._prevFOV = this.fov;
        }

        // currentFOV = glm::lerp(currentFOV, fov, (float) (Timer::time() - fovStartTime) / fovDuration);

        if(this._isShaking)
        {
            let x = Math.random() / RAND_MAX * this._shakeAmount - this._shakeAmount / 2.0;
            let y = Math.random() / RAND_MAX * this._shakeAmount - this._shakeAmount / 2.0;
            let z = Math.random() / RAND_MAX * this._shakeAmount - this._shakeAmount / 2.0;
            var offsetPos = vec3.create();
            vec3.set(offsetPos, x, y, z);
            this.offset.position = offsetPos;

            this._shakeAmount = this._startShakeAmount * this._shakeDuration / this._startShakeDuration;
            this._shakeDuration -= deltaTime;

            if(this._shakeDuration <= 0)
            {
                this._shakeDuration = 0;
                this._shakeAmount = 0;
                this._isShaking = false;
                let initialOffsetPos = vec3.create();
                vec3.set(initialOffsetPos, 0, 0, 0);
                this.offset.position = initialOffsetPos;
            }
        }

        vec3.set(this._forward, Renderer.view[0][2], Renderer.view[1][2], Renderer.view[2][2]);
        vec3.set(this._position, this._matrix[3][0], this._matrix[3][1], this._matrix[3][2]);
        vec3.subtract(this._velocity, this._position, this._prevPosition);
        this._prevPosition = this._position;

        // Original has update info for FMOD (not written here)
        */
    }

    updateComponentClient(){

        let pos = Renderer.camera.transform.getParent().getWorldPosition();
        let forward = vec3.create();vec3.negate(forward, this.transform.getForward());
        let distance = this._zoom.currentZoom;
        let result = {};
        if(PhysicsEngine.raycastClosest(pos,forward,distance,FILTER_LEVEL_GEOMETRY,result)){
            distance = result.distance-0.1;
        }
        vec3.set(this.transform.position,0,0,distance);
    }

    screenShake(amount, duration)
    {
        if(amount >= this._shakeAmount)
        {
            this._shakeAmount = this._startShakeAmount = amount;
            this._shakeDuration = this._startShakeDuration = duration;
            this._isShaking = true;
        }
    }

    getVelocity()
    {
        return this._velocity;
    }

    getFOV()
    {
        return this._currentFOV;
    }

}