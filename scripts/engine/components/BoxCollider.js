/**
 * Created by Stephen on 4/18/2017.
 */

class BoxCollider extends Component{
  constructor(mass = 0, trigger = false, scaleX = 1, scaleY = 1, scaleZ = 1){
    super();
    this.componentType = "BoxCollider";

    this.mass = mass;
    this.trigger = trigger;
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
    this.body = new CANNON.Body({mass: this.mass, shape: boxShape});
    this.body.position.set(this.transform.getPosition()[0], this.transform.getPosition()[1],
                                this.transform.getPosition()[2]);
    //this.boxBody.quaternion.set(this.transform.getRotation()[0], this.transform.getRotation()[1],
    //                            this.transform.getRotation()[2], this.transform.getRotation()[3]);

    if(this.trigger) {
      this.body.collisionResponse = 0;
      this.body.addEventListener("collide", this.onTriggerEnter.bind(this));
    } else {
      this.body.addEventListener("collide", this.onCollision.bind(this));
    }

    PhysicsEngine.world.addBody(this.body);
  }

  update(){
    let newPos = vec3.create();
    vec3.set(newPos, this.body.position.x, this.body.position.y, this.body.position.z);
    this.transform.setPosition(newPos);

    //console.log("box collider: " + this.boxBody.quaternion);
  }

  onTriggerEnter(e){
    console.log("triggered by: " + this.gameObject.name);
    console.log("\tCollided with body:",e.body);
    console.log("\tContact between bodies:",e.contact)
  }

  onCollision(e){
    console.log("collision event");
    console.log("\ttriggered by: " + this.gameObject.name);
    console.log("\tCollided with body:",e.body);
    console.log("\tContact between bodies:",e.contact)
  }

  setTrigger(isTrigger){
    this.trigger = isTrigger;
  }
}