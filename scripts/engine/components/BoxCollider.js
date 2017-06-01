/**
 * Created by Stephen on 4/18/2017.
 */

class BoxCollider extends Collider{
  constructor(params = {mass: 0, trigger: false, scaleX: 1, scaleY: 1, scaleZ: 1}){
    super({mass: params.mass, trigger: params.trigger});

    this.scaleX = params.scaleX;
    this.scaleY = params.scaleY;
    this.scaleZ = params.scaleZ;
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