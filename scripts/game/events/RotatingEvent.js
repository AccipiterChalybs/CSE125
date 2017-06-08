/**
 * Created by ajermaky on 6/7/17.
 */
class RotatingEvent extends SingingEvent{
  constructor(params = {maximumCharge:12,angularVelocity:.5,radius:1}){
    super(params);
    this._angularVelocity = params.angularVelocity;
    this._radiusSquared= params.radius*params.radius;
    this._circum = 2*Math.PI;
  }

  start(){
    this._rotPos = this.transform.getWorldPosition();
    this._rotPos[1] = 0;
    this._arcDistTravelled = 0;
  }

  onUncharged(){

  }

  onCharged(){
    // this.transform.rotateY(this._rotationDelta);
  }

  // TODO take a look why (this._circum * (this.currentCharge / this.maximumCharge)) checks result in bouncing up and down while rotating
  onDischarging(){
    if(this._arcDistTravelled > 0 && ((this._arcDistTravelled) >= (this._circum * (this.currentCharge / this.maximumCharge))))
    {
      Debug.log("welp");
      let deltaY = -this._angularVelocity*Time.deltaTime;
      this.transform.rotateZ(deltaY);
      for (let player of PlayerTable.players) {
        let playPos = player.transform.getWorldPosition();
        let distance = vec3.create();
        vec3.sub(distance, playPos, this._rotPos);
        if (distance[0] * distance[0] + distance[2] * distance[2] < this._radiusSquared) {
          player.transform.rotateY(deltaY);
          let translate = vec3.fromValues(Math.cos(-deltaY) * distance[0] - Math.sin(-deltaY) * distance[2], 0, Math.sin(-deltaY) * distance[0] + Math.cos(-deltaY) * distance[2]);
          vec3.add(translate, translate, this._rotPos);
          let body = player.getComponent("Collider").body;
          body.position.x = translate[0];
          body.position.y = translate[1];
          body.position.z = translate[2];
        }
      }
      this._arcDistTravelled += deltaY;
    }else{
      Debug.log("Here")
    }
  }

  onCharging(){
    if(this._arcDistTravelled < this._circum && ((this._arcDistTravelled < (this._circum * (this.currentCharge / this.maximumCharge)))))
    {
      let deltaY = this._angularVelocity*Time.deltaTime;
      this.transform.rotateZ(deltaY);
      for(let player of PlayerTable.players){
        let playPos = player.transform.getWorldPosition();
        let distance = vec3.create();
        vec3.sub(distance,playPos,this._rotPos);
        if(distance[0]*distance[0] + distance[2]*distance[2]<this._radiusSquared){
          player.transform.rotateY(deltaY);
          let translate = vec3.fromValues(Math.cos(-deltaY)*distance[0] - Math.sin(-deltaY)*distance[2], 0 ,Math.sin(-deltaY)*distance[0] + Math.cos(-deltaY)*distance[2]);
          vec3.add(translate,translate,this._rotPos);
          let body = player.getComponent("Collider").body;
          body.position.x = translate[0];
          body.position.y = translate[1];
          body.position.z = translate[2];
        }
      }
      this._arcDistTravelled += deltaY;
    }else{

    }
  }
}