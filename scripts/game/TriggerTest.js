/**
 * Created by Stephen on 4/28/2017.
 */

class TriggerTest extends Interactable{
  constructor(){
    super();

    this._currentChargeTime = 0;
  }

  interact(interactingObj){
    let player = interactingObj.getComponent("PlayerController");

    console.log(player, " is interacting with me. ", this.gameObject);
  }
}