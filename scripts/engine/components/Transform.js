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

    setDirty(){}

    translate(x, y, z){}

    rotate(diff){}

    scale(s){}

    get transformMatrix(){}

    get rotation(){}

    set rotation(rotation){}

    get position(){}

    set position(x, y, z){}

    get scale(){}

    set scale(scale){}

    get worldScale(){}
}
