/**
 * Created by Stephen on 4/21/2017.
 */

// Don't call 'new' on this class. It's meant to be abstract.
class Collider extends Component{
  constructor({mass = 0, trigger = false}) {
    super();
    this.componentType = 'Collider';

    this.mass = mass;
    this.trigger = trigger;
    this.freezeRotation = false;
    this.layer = FILTER_DEFAULT;
  }

  start() {
    let worldPosition = this.transform.getWorldPosition();
    this.body.position.set(worldPosition[0], worldPosition[1],
      worldPosition[2]);

    let worldRotation = this.transform.getWorldRotation();
    this.body.quaternion.set(worldRotation[0], worldRotation[1],
      worldRotation[2], worldRotation[3]);
  }


  _setGameObject(go){
    super._setGameObject(go);
    if (this.transform === null) {
      return;
    }

    this.body = new CANNON.Body({ mass: this.mass });

    let worldPosition = this.transform.getWorldPosition();
    this.body.position.set(worldPosition[0], worldPosition[1],
      worldPosition[2]);

    // TODO: may be a problem in the future if the objects start with a weird rotation
    this.body.quaternion.set(this.transform.getWorldRotation()[0], this.transform.getWorldRotation()[1],
                                this.transform.getWorldRotation()[2], this.transform.getWorldRotation()[3]);

    if (this.trigger) {
      this.body.collisionResponse = 0;
      this.body.addEventListener('collide', this._onTriggerEnter.bind(this));
    } else {
      this.body.addEventListener('collide', this._onCollisionEnter.bind(this));
    }

    this.body.angularDamping = DEFAULT_ANGULAR_DAMPING;

    // console.log("Created a collider (game object name, id): (" + this.gameObject.name + ", " +
    //   this.body.id + ")");

    PhysicsEngine.addBody(this, this.body, this.layer);
  }

  updateComponent() {
    //this.body.angularVelocity.set(this.body.angularVelocity.x / 2, this.body.angularVelocity.y / 2, this.body.angularVelocity.z / 2);
    if (this.layer !== FILTER_KINEMATIC)
    {
      let newPos = vec3.create();
      vec3.set(newPos, this.body.position.x, this.body.position.y, this.body.position.z);
      this.transform.setWorldPosition(newPos);

      if (!this.freezeRotation) {
        let newRot = quat.fromValues(this.body.quaternion.x, this.body.quaternion.y,
          this.body.quaternion.z, this.body.quaternion.w);

        //TODO may need to do something like 'setWorldRotation' here.
        this.transform.setWorldRotation(newRot);
      } else {
        let bodyRotation = this.transform.getWorldRotation();
        this.body.quaternion.set( bodyRotation[0],
          bodyRotation[1],
          bodyRotation[2],
          bodyRotation[3]);
      }
    }else {
      this.body.position.x = this.transform.getWorldPosition()[0];
      this.body.position.y = this.transform.getWorldPosition()[1];
      this.body.position.z = this.transform.getWorldPosition()[2];

      let bodyRotation = this.transform.getWorldRotation();
      this.body.quaternion.set( bodyRotation[0],
        bodyRotation[1],
        bodyRotation[2],
        bodyRotation[3]);

    }
  }

  _onTriggerEnter(e) {
    let collider = PhysicsEngine.getCollider(e.body.id);

    if (Debug.collision.printInfo) {
      Debug.printCollisionInfo(e, this.gameObject, true);
    }

    this.gameObject.onTriggerEnter(collider);
  }

  _onCollisionEnter(e) {
    let collider = PhysicsEngine.getCollider(e.body.id);

    if (Debug.collision.printInfo) {
      Debug.printCollisionInfo(e, this.gameObject, false);
    }

    this.gameObject.onCollisionEnter(collider);
  }

  setTrigger(isTrigger) {
    this.trigger = isTrigger;
  }

  setFreezeRotation(freezeRot) {
    this.freezeRotation = freezeRot;
  }

  setRotation(newRot) {
    this.body.quaternion.set(newRot[0], newRot[1], newRot[2], newRot[3]);
  }

  setAngularDamping(angularDamp) {
    this.body.angularDamping = angularDamp;
  }

  setPhysicsMaterial(material) {
    this.body.material = PhysicsEngine.world.materials[material];

    //console.log(this.body.material);
  }

  setLayer(layer) {
    let idx = PhysicsEngine.layers[this.layer].indexOf(this.body.id);
    PhysicsEngine.layers[this.layer].splice(idx, 1);
    this.layer = layer;
    PhysicsEngine.layers[this.layer].push(this.body.id);

  }
}
