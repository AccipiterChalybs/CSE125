/**
 * Created by Stephen on 4/21/2017.
 */

// Don't call 'new' on this class. It's meant to be abstract.
class Collider extends Component{
  constructor(mass = 0, trigger = false){
    super();
    this.componentType = "Collider";

    this.mass = mass;
    this.trigger = trigger;
  }

  _setGameObject(go){
    super._setGameObject(go);
    if(this.transform === null) {
      return;
    }

    this.body = new CANNON.Body({mass: this.mass});

    this.body.position.set(this.transform.getPosition()[0], this.transform.getPosition()[1],
      this.transform.getPosition()[2]);

    // TODO: may be a problem in the future if the objects start with a weird rotation
    //this.body.quaternion.set(this.transform.getRotation()[0], this.transform.getRotation()[1],
    //                            this.transform.getRotation()[2], this.transform.getRotation()[3]);

    if(this.trigger) {
      this.body.collisionResponse = 0;
      this.body.addEventListener("collide", this._onTriggerEnter.bind(this));
    } else {
      this.body.addEventListener("collide", this._onCollisionEnter.bind(this));
    }

    // console.log("Created a collider (game object name, id): (" + this.gameObject.name + ", " +
    //   this.body.id + ")");

    PhysicsEngine.world.addBody(this.body);
  }

  updateComponent(){
    let newPos = vec3.create();
    vec3.set(newPos, this.body.position.x, this.body.position.y, this.body.position.z);
    this.transform.setPosition(newPos);
  }

  _onTriggerEnter(e){
     console.log("TRIGGER event. (" + this.gameObject.name + ")");
     console.log("\tCollided with body:",e.body);
     console.log("\tContact between bodies:",e.contact);
    this.gameObject.onTriggerEnter(e);
  }

  _onCollisionEnter(e){
     console.log("COLLISION event. (" + this.gameObject.name + ")");
     console.log("\tCollided with body:",e.body);
     console.log("\tContact between bodies:",e.contact);
    this.gameObject.onCollisionEnter(e);
  }

  setTrigger(isTrigger){
    this.trigger = isTrigger;
  }

  setPhysicsMaterial(material){
    this.body.material = PhysicsEngine.world.materials[material];

    //console.log(this.body.material);
  }
}