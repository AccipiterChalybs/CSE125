/**
 * Created by Stephen on 4/18/2017.
 */

class BoxCollider extends Component{
  constructor(mass = 0, scaleX = 1, scaleY = 1, scaleZ = 1){
    super();
    this.componentType = "BoxCollider";

    this.mass = mass;
    this.scaleX = scaleX;
    this.scaleY = scaleY;
    this.scaleZ = scaleZ;
  }

  _setGameObject(go){
    super._setGameObject(go);
    if(this.transform === null) {
      return;
    }

    let halfExtents = new CANNON.Vec3(this.transform.getScale()[0] * this.scaleX,
                                        this.transform.getScale()[1] * this.scaleY,
                                        this.transform.getScale()[2] * this.scaleZ);
    let boxShape = new CANNON.Box(halfExtents);
    this.boxBody = new CANNON.Body({mass: this.mass, shape: boxShape});
    this.boxBody.position.set(this.transform.getPosition()[0], this.transform.getPosition()[1],
                                this.transform.getPosition()[2]);
    this.boxBody.quaternion.set(this.transform.getRotation()[0], this.transform.getRotation()[1],
                                this.transform.getRotation()[2], this.transform.getRotation()[3])

    PhysicsEngine.world.add(this.boxBody);
  }

  update(){
    let newPos = vec3.create();
    vec3.set(newPos, this.boxBody.position.x, this.boxBody.position.y, this.boxBody.position.z);
    this.transform.setPosition(newPos);

    //console.log("box collider: " + this.boxBody.position);
  }
}