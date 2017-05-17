/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */

class Transform extends Component
{
    constructor()
    {        
        super();
        this.componentType = "Transform";
        this.position = vec3.create();
        this.rotation = quat.create();
        this.scaleFactor = vec3.create(); vec3.set(this.scaleFactor,1,1,1);
        this.transformMatrixDirty = true;
        this.transformMatrix = mat4.create();
        this.cachedWorldPos = vec3.create();
        this.worldPosDirty = true;
        this.cachedWorldScale = vec3.create();
        this.worldScaleDirty = null;
        this.cachedForwardVec = vec3.create();
        this.worldForwardDirty = true;
        this.serializeDirty = true;
        this.oldParent = null;
        this._parent = null;
        this.children = [];
    }

    setDirty()
    {
        this.transformMatrixDirty = true;
        this.worldPosDirty = true;
        this.worldScaleDirty = true;
        this.worldForwardDirty = true;
        this.serializeDirty = true;

      for(let child of this.children)
        {
            child.setDirty();
        }
    }

    setParent(par) {
        this._parent = par;
        par.children.push(this);
    }

    getParent() {
        return this._parent;
    }

    translate(diff)
    {
        this.setDirty();
        vec3.add(this.position, this.position, diff);
    }

    rotate(diff)
    {
        this.setDirty();
        let combinedQuat = quat.create();
        quat.multiply(combinedQuat, this.rotation, diff);
        this.rotation = combinedQuat;
    }

    rotateX(theta) {
        this.setDirty();
        quat.rotateX(this.rotation, this.rotation, theta);
    }

    rotateY(theta) {
        this.setDirty();
        quat.rotateY(this.rotation, this.rotation, theta);
    }

    rotateZ(theta) {
        this.setDirty();
        quat.rotateZ(this.rotation, this.rotation, theta);
    }

    scale(s)
    {
        this.setDirty();
        vec3.scale(this.scaleFactor, this.scaleFactor, s);
    }

    getTransformMatrix()
    {
        if(this.transformMatrixDirty || this._parent !== this.oldParent)
        {
            this.transformMatrix = mat4.create();


            // Translation
            mat4.translate(this.transformMatrix, this.transformMatrix, this.position);

            // Rotation
            let rotationMat = mat4.create();
            mat4.fromQuat(rotationMat, this.rotation);
            mat4.multiply(this.transformMatrix, this.transformMatrix, rotationMat);

            // Scale
            mat4.scale(this.transformMatrix, this.transformMatrix, this.scaleFactor);

            let parMat = (this._parent !== null) ? this._parent.getTransformMatrix() : mat4.create();
            mat4.multiply(this.transformMatrix, parMat, this.transformMatrix);
            this.transformMatrixDirty = false;
            this.oldParent = this._parent;
        }


        return this.transformMatrix;
    }

    getRotation(){
        return this.rotation;
    }

    setRotation(rot)
    {
        this.setDirty();
        this.rotation = rot;
    }

    getPosition()
    {
        return this.position;
    }

    setPosition(pos)
    {
        this.setDirty();
        this.position = pos;
    }

    getScale()
    {
        return this.scaleFactor;
    }

    setScale(s)
    {
        this.setDirty();
        vec3.set(this.scaleFactor,s,s,s);
    }

    getWorldPosition()
    {
        if(this.worldPosDirty)
        {
            let originPoint = vec4.create();
            vec4.set(originPoint, 0, 0, 0, 1);

            let tmpWorldPos = vec4.create();
            vec4.transformMat4(tmpWorldPos, originPoint, this.getTransformMatrix());
            vec3.set(this.cachedWorldPos, tmpWorldPos[0], tmpWorldPos[1], tmpWorldPos[2]);
            this.worldPosDirty = false;
        }

        return this.cachedWorldPos;
    }

    getWorldScale()
    {
        if(this.worldScaleDirty)
        {
            let scaleVector = vec3.create();
            let transformMatrix = this.getTransformMatrix();
            vec3.set(scaleVector, transformMatrix[0][0], transformMatrix[0][1], transformMatrix[0][2]);
            this.cachedWorldScale = vec3.length(scaleVector);
            this.worldScaleDirty = false;
        }

        return this.cachedWorldScale;
    }

    getForward()
    {
      if(this.worldForwardDirty)
      {
        let forwardVector = vec4.create();
        vec4.set(forwardVector, 0, 0, -1, 0);

        let tmpForwardVec = vec4.create();
        vec4.transformMat4(tmpForwardVec, forwardVector, this.getTransformMatrix());
        vec3.set(this.cachedForwardVec, tmpForwardVec[0], tmpForwardVec[1], tmpForwardVec[2]);
        this.worldForwardDirty = false;
      }

      return this.cachedForwardVec;
    }

    serialize() {
        if(this.serializeDirty){
          let retVal = {};
          retVal.p = this.position;
          retVal.r = this.rotation;
          retVal.s = this.scaleFactor[0];
          this.serializeDirty = false; // Dont know if need
          return retVal;

        }
        return null;
    }

    applySerializedData(data) {
        this.setDirty();
        this.position = data.p;
        this.rotation = data.r;
        this.scaleFactor[0] = this.scaleFactor[1] = this.scaleFactor[2] = data.s;
        // let index=0;
        // for (let child of this.children) {
        //     Debug.assert(index < data.c.length);
        //
        //     if(index < data.c.length)
        //     {
        //       child.applySerializedData(data.c[index]);
        //     }
        //
        //     ++index;
        // }
    }
}
