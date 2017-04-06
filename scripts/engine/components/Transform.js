/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */
class Transform extends Component
{
    constructor()
    {
        this.position = null;
        this.rotation = null;
        this.scaleFactor = null;
        this.transformMatrixDirty = null;
        this.transformMatrix = null;
        this.cachedWorldPos = null;
        this.worldPosDirty = null;
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
        setDirty();
        vec3.add(this.position, this.position, diff);
    }

    rotate(diff)
    {
        setDirty();
        quat.multiply(let combinedQuat, this.rotation, diff);
        this.rotation = combinedQuat;
    }

    scale(s)
    {
        setDirty();
        this.scaleFactor *= s;
    }

    getTransformMatrix()
    {
        if(this.transformMatrixDirty || this.parent != this.oldParent)
        {
            this.transformMatrix = mat4.create();

            // Translation
            mat4.translate(this.transformMatrix, this.transformMatrix, this.position);

            // Rotation
            mat4.fromQuat(let rotationMat, this.rotation);
            mat4.multiply(this.transformMatrix, this.transformMatrix, rotationMat);

            // Scale
            mat4.scale(this.transformMatrix, this.transformMatrix, this.scaleFactor);

            let parMat = (this.parent == null) ? this.parent.getTransformMatrix() : mat4.create();
            mat4.multiply(this.transformMatrix, parMat, this.transformMatrix);
            this.transformMatrixDirty = false;
            this.oldParent = this.parent;
        }

        return this.transformMatrix;
    }

    get rotation(){}

    set rotation(rot)
    {
        setDirty();
    }

    get position(){}

    set position(pos)
    {
        setDirty();
    }

    get scale(){}

    set scale(s)
    {
        setDirty();
    }

    getWorldPosition()
    {
        if(this.worldPosDirty)
        {
            let originPoint = vec4.create();
            vec4.set(originPoint, 0, 0, 0, 1);

            vec4.transformMat4(var tmpWorldPos, originPoint, getTransformMatrix());
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
