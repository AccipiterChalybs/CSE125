/**
 * Created by Stephen on 4/18/2017.
 */

class SphereCollider extends Collider{
  constructor(mass = 0, trigger = false, scale = 1){
    super(mass, trigger);

    this.scale = scale;
  }

  _setGameObject(go){
    super._setGameObject(go);

    let radius = this.transform.getScale()[0] * this.scale;
    let sphereShape = new CANNON.Sphere(radius);
    this.body.addShape(sphereShape);
  }
}