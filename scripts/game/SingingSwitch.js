/**
 * Created by Stephen on 5/2/2017.
 */

const SWITCH_CHARGE_RATE = 5; // per second
const SWITCH_LOSS_RATE = 0.5; // per second
const TIME_BEFORE_LOSS = 3;

class SingingSwitch extends Listenable {
  constructor(params = {event: null, activationLevel: 0}) {
    super();
    this._event = params.event;
    this.activationLevel = params.activationLevel;
    this.charged = false;
    this.time_before_loss = time_before_loss;
    this._lastSingTime = 0;
    this._currentCharge = 0;
  }

  start() {
    this._collider = this.transform.gameObject.getComponent('Collider');
    //this._singer = this.transform.gameObject.getComponent("Sing");
    this._collider.setPhysicsMaterial(PhysicsEngine.materials.basicMaterial);
    this._collider.setFreezeRotation(true);
  }

  updateComponent() {
    //TODO Clean up this logic

    if (this.charged === true && Time.time - this._lastSingTime >= this.time_before_loss) {
      this._currentCharge = Utility.moveTowards(this._currentCharge, 0, SWITCH_LOSS_RATE * Time.deltaTime);
      for (let event of this._events) {
        event.setCurrentState(EventState.discharging);
      }
      this.charged = false;
    }else{
      if (this._currentCharge === 0 && Time.time - this._lastSingTime >= this.time_before_loss) {
        this.uncharged();
      }else if (Time.time - this._lastSingTime >= this.time_before_loss) {
        this._currentCharge = Utility.moveTowards(this._currentCharge, 0, SWITCH_LOSS_RATE * Time.deltaTime);
        for (let event of this._events) {
          event.setCurrentState(EventState.discharging);
        }
      }else if (Time.time <= this._lastSingTime + 0.1) {
        this._currentCharge = Utility.moveTowards(this._currentCharge, this.activationLevel, SWITCH_CHARGE_RATE * Time.deltaTime);

        if(this._currentCharge===this.activationLevel){
          this.fullyCharged();
        }else{
          for (let event of this._events) {
            event.setCurrentState(EventState.charging);
          }
        }
      }else if (this._currentCharge > this.activationLevel - 0.01) {
        this.fullyCharged();
      }else{
        this._currentCharge = Utility.moveTowards(this._currentCharge, 0, SWITCH_LOSS_RATE * Time.deltaTime);
        for (let event of this._events) {
          event.setCurrentState(EventState.discharging);
        }
      }
    }


    this.transform.setScale(this._currentCharge / 100 + 0.02);
  }

  uncharged() {
    // Debug.log('I am uncharged');
    for (let event of this._events) {
      event.setCurrentState(EventState.uncharged);
    }

    this.charged = false;
  }

  fullyCharged() {
    // Debug.log('I am charged!');
    for (let event of this._events) {
      event.setCurrentState(EventState.charged);
    }

    this.charged = true;
  }

  listen(interactingObj) {

    let singer = interactingObj.getComponent('Sing');

    //console.log(player, " is interacting with me. ", this.gameObject);
    if (singer && singer !== null) {
      this._lastSingTime = Time.time;
    }
  }
}
