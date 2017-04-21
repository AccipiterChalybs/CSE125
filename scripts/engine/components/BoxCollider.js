/**
 * Created by Stephen on 4/18/2017.
 */

class BoxCollider extends Collider{
  constructor(mass = 0, trigger = false, scaleX = 1, scaleY = 1, scaleZ = 1){
    super(mass, trigger);

    this.scaleX = scaleX;
    this.scaleY = scaleY;
    this.scaleZ = scaleZ;
  }

  _setGameObject(go){
    super._setGameObject(go);

    let halfExtents = new CANNON.Vec3(this.transform.getScale()[0] * this.scaleX,
                                        this.transform.getScale()[1] * this.scaleY,
                                        this.transform.getScale()[2] * this.scaleZ);
    let boxShape = new CANNON.Box(halfExtents);
    this.body.addShape(boxShape);
  }
}