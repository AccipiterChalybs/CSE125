/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */
class Transform extends Component
{
    constructor()
    {        
        super();
        this.position = vec3.create();
        this.rotation = quat.create();
        this.scaleFactor = vec3.create();
        this.transformMatrixDirty = true;
        this.transformMatrix = null;
        this.cachedWorldPos = null;
        this.worldPosDirty = true;
        this.cachedWorldScale = null;
        this.worldScaleDirty = null;
        this.oldParent = null;
        this.parent = null;
        this.children = [];
    }

    setDirty()
    {
        this.transformMatrixDirty = true;
        this.worldPosDirty = true;
        this.worldScaleDirty = true;
        for(let child of this.children)
        {
            child.setDirty();
        }
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

    scale(s)
    {
        this.setDirty();
        this.scaleFactor *= s;
    }

    getTransformMatrix()
    {
        if(this.transformMatrixDirty || this.parent !== this.oldParent)
        {
            this.transformMatrix = mat4.create();

            // Translation
            mat4.translate(this.transformMatrix, this.transformMatrix, this.position);

            // Rotation
            let rotationMat = mat4();
            mat4.fromQuat(rotationMat, this.rotation);
            mat4.multiply(this.transformMatrix, this.transformMatrix, rotationMat);

            // Scale
            mat4.scale(this.transformMatrix, this.transformMatrix, this.scaleFactor);

            let parMat = (this.parent === null) ? this.parent.getTransformMatrix() : mat4.create();
            mat4.multiply(this.transformMatrix, parMat, this.transformMatrix);
            this.transformMatrixDirty = false;
            this.oldParent = this.parent;
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
        this.scaleFactor = scale;
    }

    getWorldPosition()
    {
        if(this.worldPosDirty)
        {
            let originPoint = vec4.create();
            vec4.set(originPoint, 0, 0, 0, 1);

            let tmpWorldPos = mat4.create();
            vec4.transformMat4(tmpWorldPos, originPoint, getTransformMatrix());
            vec3.set(this.cachedWorldPos, tmpWorldPos[0], tmpWorldPos[1], tmpWorldPos[2]);
            this.worldPosDirty = false;
        }

        return this.cachedWorldPos;
    }

    getWorldScale()
    {
        if(this.worldScaleDirty)
        {
            var scaleVector = vec3.create();
            var transformMatrix = getTransformMatrix();
            vec3.set(scaleVector, transformMatrix[0][0], transformMatrix[0][1], transformMatrix[0][2]);
            this.cachedWorldScale = vec3.length(scaleVector);
            this.worldScaleDirty = false;
        }

        return this.cachedWorldScale;
    }
}
