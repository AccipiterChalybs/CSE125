// const REGULAR_SPEED = 4;
// const WALK_SPEED = 2;
// const SING_SPEED = 0.8;
// const PLAYER_ACCELERATION = 4;
// const COOLDOWN_SINGING = 0.1;   // In seconds

class MoveTowardsEvent extends SingingEvent{
  constructor({target,maximumCharge}) {
    super({maximumCharge: maximumCharge});
    this.target = target;
    // this.movementSpeed = REGULAR_SPEED;
    this.setCurrentState(EventState.uncharged);
  }

  start() {
    this._collider = this.transform.gameObject.getComponent('Collider');
    //this._singer = this.transform.gameObject.getComponent("Sing");
    this._collider.setPhysicsMaterial(PhysicsEngine.materials.basicMaterial);
    this._collider.setFreezeRotation(true);
  }

  updateComponent() {
    super.updateComponent();
  }

  onUncharged() {

  }

  onCharged() {
    let pos = vec3.create();
    let targetpos = this.target.transform.getWorldPosition();
    pos[0] = Utility.moveTowards(this.transform.position[0], targetpos[0], Time.deltaTime);
    pos[1] = Utility.moveTowards(this.transform.position[1], targetpos[1], Time.deltaTime);
    pos[2] = Utility.moveTowards(this.transform.position[2], targetpos[2], Time.deltaTime);
    this.transform.setWorldPosition(pos);

  }

  onDischarging() {
  }

  onCharging() {
  }

}
