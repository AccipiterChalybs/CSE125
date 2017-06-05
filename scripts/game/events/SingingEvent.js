const EventState = {
  uncharged: "uncharged",
  charged: "charged",
  discharging: "discharging",
  charging: "charging"
};

class SingingEvent extends Event{
  constructor({maximumCharge}){
    super();

    this.maximumCharge = maximumCharge;
    this.currentCharge = 0;

    this._lastCharge = 0;
    this._currentState = EventState.uncharged;
  }

  start(){
  }

  startClient(){
    // this._singingSrc = this.transform.gameObject.getComponent("AudioSource");
  }

  updateComponentClient(){

  }

  updateComponent() {
    if(this.currentCharge === this.maximumCharge){
      this.setCurrentState(EventState.charged);
    }else if(this.currentCharge === 0){
      this.setCurrentState(EventState.uncharged);
    }else if(this.currentCharge >= this._lastCharge){
      this.setCurrentState(EventState.charging);
    } else{
      this.setCurrentState(EventState.discharging);
    }

    switch (this.getCurrentState()){
      case EventState.charged:
        this.onCharged();
        break;
      case EventState.uncharged:
        this.onUncharged();
        break;
      case EventState.charging:
        this.onCharging();
        break;
      case EventState.discharging:
        this.onDischarging();
        break;
    }

    this._lastCharge = this.currentCharge;
    this.currentCharge = 0;
  }

  charge(amt){
    this.currentCharge += amt;
    if(this.currentCharge > this.maximumCharge){
      this.currentCharge = this.maximumCharge;
    }
  }

  onUncharged(){

  }

  onCharged(){

  }

  onDischarging(){

  }

  onCharging(){
  }

  getCurrentState(){
    return this._currentState;
  }

  setCurrentState(newState){
    this._currentState = newState;
  }
}