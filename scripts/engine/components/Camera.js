/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */

class Camera extends Component
{

    constructor ()
    {
        super();
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
        vec3.set(up, 0, 1, 0);
        this._position = null;
        this._prevPosition = null;
        this._velocity=null;

        this._matrix = null;


        let initialOffsetPos = vec3.create();
        vec3.set(initialOffsetPos, 0, 0, 0);
        this.offset = new Transform();
        this.offset.position = initalOffsetPos;
        this.fovDuration = 1;
    }

    getCameraMatrix()
    {
        mat4.multiply(this._matrix,
            this.gameObject.transform.getTransformMatrix(), this.offset.getTransformMatrix());
        let scale = vec3.create();
        let tmpMatrixRow = vec3.create();
        vec3.set(tmpMatrixRow, this._matrix[0][0], this._matrix[1][0], this._matrix[2][0]);
        scale[0] = 1 / vec3.length(tmpMatrixRow);
        vec3.set(tmpMatrixRow, this._matrix[0][1], this._matrix[1][1], this._matrix[2][1]);
        scale[1] = 1 / vec3.length(tmpMatrixRow);
        vec3.set(tmpMatrixRow, this._matrix[0][2], this._matrix[1][2], this._matrix[2][2]);
        scale[2] = 1 / vec3.length(tmpMatrixRow);

        let camScaledMatrix = mat4.create();
        mat4.scale(camScaledMatrix, this._matrix, scale);

        let dummy = mat4.create();
        return mat4.invert(dummy, camScaledMatrix);
    }

    update(deltaTime)
    {
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

    getForward()
    {
        let dummy = mat4.create();
        return vec3.negate(dummy, this._forward);
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