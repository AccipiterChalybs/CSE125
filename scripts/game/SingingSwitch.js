/**
 * Created by Stephen on 5/2/2017.
 */

const SWITCH_CHARGE_RATE = 5; // per second
const SWITCH_LOSS_RATE = 0.5; // per second
const TIME_BEFORE_LOSS = 3;

class SingingSwitch extends Interactable{
  constructor(activationLevel){
    super();

    this.activationLevel = activationLevel;
    this.charged = false;

    this._lastSingTime = 0;
    this._currentCharge = 0;
  }

  updateComponent(){
    if(this.charged === false || Time.time - this._lastSingTime >= TIME_BEFORE_LOSS){
      this._currentCharge = Utility.moveTowards(this._currentCharge, 0, SWITCH_LOSS_RATE * Time.deltaTime);
    }
    if(Time.time <= this._lastSingTime + 0.1){
      this._currentCharge = Utility.moveTowards(this._currentCharge, this.activationLevel, SWITCH_CHARGE_RATE * Time.deltaTime);
    }

    if(this.charged === false && this._currentCharge > this.activationLevel - 0.01){
      this.fullyCharged();
    }else if(this.charged === true && Time.time - this._lastSingTime >= TIME_BEFORE_LOSS){
      this.uncharged();
    }

    this.transform.setScale(this._currentCharge / 100 + 0.02);
  }

  uncharged(){
    Debug.log("I became uncharged");
    this.charged = false;
  }

  fullyCharged(){
    Debug.log("I am charged!");
    this.charged = true;
  }

  interact(interactingObj){
    let player = interactingObj.getComponent("Sing");

    //console.log(player, " is interacting with me. ", this.gameObject);
    if(player && player !== null){
      this._lastSingTime = Time.time;
    }
  }
}