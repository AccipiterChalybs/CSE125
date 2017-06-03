class MoveTowardsEvent extends TriggerEvent{
  constructor(params = {endPos: vec3.create(), timeToTake: 3}) {
    super();

    this.endPos = params.endPos;
    this.timeToTake = params.timeToTake;

    this.activated = false;

    this._startPos = vec3.create();
    this._endTime = 0;
  }

  updateComponent(){
    if(this.activated && Time.time <= this._endTime){
      let newPos = vec3.create();
      vec3.lerp(newPos, this._startPos, this.endPos, 1 - (this._endTime - Time.time) / this.timeToTake);
      this.transform.setPosition(newPos);
    }
  }

  triggered(){
    if(!this.activated) {
      this.activated = true;
      this._startPos = this.transform.getPosition();
      this._endTime = Time.time + this.timeToTake;
    }
  }
}
