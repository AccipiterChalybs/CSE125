/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */

const ZOOM_BUFFER = 0.1;
const CAMERA_X_OFFSET = 0.15;
const CAMERA_Y_OFFSET = 0.75;
const CAMERA_NORMAL_SCALE = 0.1;
const CAMERA_SPEED_DOLLY = 0.5;
const CAMERA_WALK_OFFSET = 0.25;


// Camera needs TWO game objects above it. First for orientation, second for position
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

    this._currentFOV = Math.atan(1.0) * 4.0 / 3.0;
    this._up = vec3.create(); vec3.set(this._up, 0, 1, 0);
    this._matrix = mat4.create();

    this._playerFocus = null;

    this._zoom = null;              // Component
    this._rotateMouse = null;       // Component
    this._targetTransform = null;   // Transform
    this._cameraOrientation = null; // Transform
  }

  startClient(){
    this._playerFocus = PlayerTable.getPlayer().getComponent("PlayerController");

    this._zoom = this.transform.gameObject.getComponent("ZoomMouse");
    this._rotateMouse = this.transform.gameObject.getComponent("RotateMouse");
    this._cameraOrientation = this.transform.getParent().getParent();
    this._targetTransform = this.transform.getParent();

    this._cameraOrientation.gameObject.addComponent(new ClientStickTo({target: this._playerFocus.gameObject,
      offset: vec3.fromValues(0, CAMERA_Y_OFFSET, 0)}));

    let targetPos = vec3.fromValues(CAMERA_X_OFFSET, 0, 0);
    this._targetTransform.setPosition(targetPos);
    this.transform.setPosition(vec3.fromValues(0, 0, this._zoom.currentZoom));
  }

  getCameraMatrix()
  {
    this._matrix = this.gameObject.transform.getTransformMatrix();
    let scale = vec3.create();
    let tmpMatrixRow = vec3.create();

    vec3.set(tmpMatrixRow, this._matrix[0], this._matrix[4], this._matrix[8]);
    scale[0] = 1 / vec3.length(tmpMatrixRow);
    vec3.set(tmpMatrixRow, this._matrix[1], this._matrix[5], this._matrix[9]);
    scale[1] = 1 / vec3.length(tmpMatrixRow);
    vec3.set(tmpMatrixRow, this._matrix[2], this._matrix[6], this._matrix[10]);
    scale[2] = 1 / vec3.length(tmpMatrixRow);

    let camScaledMatrix = mat4.create();
    mat4.scale(camScaledMatrix, this._matrix, scale);

    let dummy = mat4.create();
    return mat4.invert(dummy, camScaledMatrix);
  }


  updateComponent()
  {
  }

  updateComponentClient(){
    let pos = this._targetTransform.getWorldPosition();

    let backward = vec3.create();vec3.negate(backward, this.transform.getForward());
    let right = vec3.create(); vec3.cross(right, backward, this._up);
    vec3.scale(right, ZOOM_BUFFER);
    let up = vec3.create(); vec3.cross(up, right, backward);
    vec3.scale(up, ZOOM_BUFFER);
    let backRight = vec3.create(); vec3.add(backRight, backward, right);
    let backLeft = vec3.create(); vec3.subtract(backLeft, backward, right);
    let backUp = vec3.create(); vec3.add(backUp, backward, up);
    let backDown = vec3.create(); vec3.subtract(backDown, backward, up);

    let newZoom = this._zoom.currentZoom;
    if(this._playerFocus.getCurrentState() === 'walking'){
      newZoom += CAMERA_WALK_OFFSET;
    }

    let distance = newZoom;
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

    let dollySpeed = distance < newZoom ? null : CAMERA_SPEED_DOLLY;

    this.dolly({newPos: newPos, speed: dollySpeed});
    this.orbit({newRot: this._rotateMouse.dr});
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
      quat.copy(tmpRot, this._cameraOrientation.getRotation());
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

    this._cameraOrientation.setRotation(tmpRot);
  }
}