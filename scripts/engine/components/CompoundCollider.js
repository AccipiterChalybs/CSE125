/**
 * Created by Stephen on 4/18/2017.
 */

class CompoundCollider extends Collider{
  constructor(mass = 0, trigger = false, scaleX = 1, scaleY = 1, scaleZ = 1){
    super(mass, trigger);

    this.scaleX = scaleX;
    this.scaleY = scaleY;
    this.scaleZ = scaleZ;
  }


  addShape (type, size, offset) {
    if (type === "Box") {
      let halfExtents = new CANNON.Vec3(size[0]*0.5,size[1]*0.5, size[2]*0.5);
      let boxShape = new CANNON.Box(halfExtents);
      this.body.addShape(boxShape, new CANNON.Vec3(offset[0], offset[1], offset[2]));
    } else if (type === "Sphere") {
      Debug.assert(size[0] === size[1] && size[0] === size[2]);
      let radius = size[0];
      let sphereShape = new CANNON.Sphere(radius);
      this.body.addShape(sphereShape, new CANNON.Vec3(offset[0], offset[1], offset[2]));
    }
  }
}