/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */

const ZOOM_BUFFER = 0.1;
const CAMERA_IN_VELOCITY = 15;
const CAMERA_SPEED_ZOOM = 10;
const CAMERA_SPEED_DOLLY = 2;
const CAMERA_NORMAL_SCALE = 0.1;

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
        this._rotateMouse = null;

        let initialOffsetPos = vec3.create();
        vec3.set(initialOffsetPos, 0, 0, 0);
        this.offset = new Transform();
        //TODO re-enable: this.offset.position = initalOffsetPos;
        this.fovDuration = 1;
    }

    startClient(){
      this._zoom = this.transform.gameObject.getComponent("ZoomMouse");
      this._rotateMouse = this.transform.gameObject.getComponent("RotateMouse");
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

        let backward = vec3.create();vec3.negate(backward, this.transform.getForward());
        let right = vec3.create(); vec3.cross(right, backward, this._up);
        vec3.scale(right, ZOOM_BUFFER);
        let up = vec3.create(); vec3.cross(up, right, backward);
        vec3.scale(up, ZOOM_BUFFER);
        let backRight = vec3.create(); vec3.add(backRight, backward, right);
        let backLeft = vec3.create(); vec3.subtract(backLeft, backward, right);
        let backUp = vec3.create(); vec3.add(backUp, backward, up);
        let backDown = vec3.create(); vec3.subtract(backDown, backward, up);
        let distance = this._zoom.currentZoom;
        let normal = vec3.create();
        let result = {};
        if(PhysicsEngine.raycastClosest(pos,backward,distance,FILTER_LEVEL_GEOMETRY,result)){
            distance = result.distance;
            normal = result.normal;
            vec3.scale(normal, normal, CAMERA_NORMAL_SCALE);
        }
        if(PhysicsEngine.raycastClosest(pos,backRight,distance,FILTER_LEVEL_GEOMETRY,result)){
          if(result.distance < distance){
            distance = result.distance;
            normal = result.normal;
            vec3.scale(normal, normal, CAMERA_NORMAL_SCALE);
          }
        }
        if(PhysicsEngine.raycastClosest(pos,backLeft,distance,FILTER_LEVEL_GEOMETRY,result)){
          if(result.distance < distance){
            distance = result.distance;
            normal = result.normal;
            vec3.scale(normal, normal, CAMERA_NORMAL_SCALE);
          }
        }
        if(PhysicsEngine.raycastClosest(pos,backUp,distance,FILTER_LEVEL_GEOMETRY,result)){
          if(result.distance < distance){
            distance = result.distance;
            normal = result.normal;
            vec3.scale(normal, normal, CAMERA_NORMAL_SCALE);
          }
        }
        if(PhysicsEngine.raycastClosest(pos,backDown,distance,FILTER_LEVEL_GEOMETRY,result)){
          if(result.distance < distance){
            distance = result.distance;
            normal = result.normal;
            vec3.scale(normal, normal, CAMERA_NORMAL_SCALE);
          }
        }

        let newPos = vec3.fromValues(0, 0, distance);
        let tmpNormal = vec4.fromValues(normal[0], normal[1], normal[2], 0);
        vec4.transformMat4(tmpNormal, tmpNormal, mat4.transpose(mat4.create(),this.transform.getTransformMatrix()));
        vec3.set(normal, tmpNormal[0], tmpNormal[1], tmpNormal[2]);
        vec3.add(newPos, newPos, normal);

        let dollySpeed = distance < this._zoom.currentZoom ? null : CAMERA_SPEED_DOLLY;

        this.dolly({newPos: newPos, speed: dollySpeed});
        this.orbit({newRot: this._rotateMouse.dr});
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

    // Changes the FOV
    // delta is a float
    // speed is a float
    zoom({reset = false, newFOV, delta, speed}){
      let tmpFOV = this._currentFOV;
      if(reset){
        tmpFOV = Math.atan(1.0) * 4.0 / 3.0;
      }

      if(newFOV !== undefined){
        tmpFOV = newFOV;
      } else if(delta !== undefined){
        tmpFOV += delta;
      }

      if(speed !== undefined && speed !== null){
        tmpFOV = Utility.moveTowards(this._currentFOV, tmpFOV, speed * Time.deltaTime);
      }

      this._currentFOV = tmpFOV;
    }

    // Translates camera along z axis
    // delta is a float
    // speed is a float
    dolly({reset = false, newPos, newZ, delta, speed}){
      let tmpPos = vec3.create();
      if(!reset){
        vec3.copy(tmpPos, this.transform.getPosition());
      }

      if(newPos !== undefined){
        vec3.copy(tmpPos, newPos);
      }else if(newZ !== undefined){
        tmpPos[2] = newZ;
      } else if(delta !== undefined){
        tmpPos[2] += delta;
      }

      if(speed !== undefined && speed !== null){
        tmpPos = Utility.vec3.moveTowards(this.transform.getPosition(), tmpPos, speed * Time.deltaTime);
      }

      this.transform.setPosition(tmpPos);
    }

    // Rotates the camera around a pivot point (which is the parent)
    // delta is a quat
    // speed is a float
    orbit({reset = false, newRot, delta, speed}){
      let tmpRot = quat.create();
      if(!reset){
        quat.copy(tmpRot, this.transform.getParent().getRotation());
      }

      if(newRot !== undefined){
        quat.copy(tmpRot, newRot);
      } else if(delta !== undefined){
        quat.add(tmpRot, tmpRot, delta);
      }

      // Currently broken.
      // if(speed !== undefined){
      //   quat.slerp(tmpRot, this.transform.getParent().getRotation(), tmpRot, speed * Time.deltaTime);
      // }

      this.transform.getParent().setRotation(tmpRot);
    }
}