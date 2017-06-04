/**
 * Created by Accipiter Chalybs on 6/4/2017.
 */

class Foot extends Component {
  constructor(params = {left: true}) {
    super();
    this.componentType = "Foot";

    this.left = params.left;
    this.rayDistance = 1.0;
    this.stepReady = false;
  }

  updateComponentClient() {
    let result = {};
    if(PhysicsEngine.raycastClosest(this.transform.getWorldPosition(),Foot.prototype.downVector,this.rayDistance,
        FILTER_LEVEL_GEOMETRY,result)){
      let distance = result.distance;
      let normal = result.normal;

      if (distance > Foot.prototype.STEP_HEIGHT_READY) {
        this.stepReady = true;
      } else if (this.stepReady && distance < Foot.prototype.STEP_HEIGHT_COMPLETE) {
        this.stepReady = false;
        this.footstep(result.collider);
      }
    }
  }

  footstep(otherCollider) {
    console.log("Footstep", otherCollider.gameObject.name);
    let soundName = this.getFootstepSoundName(otherCollider);
    AudioEngine.soundArr[soundName].play();
  }

  getFootstepSoundName(otherCollider) {
    let surfaceType = "hard";
    let floorComp = otherCollider.gameObject.getComponent('Floor');
    if (!!floorComp) {
      surfaceType = floorComp.surfaceType;
    }
    let index = Utility.randomIntFromInterval(0, Foot.prototype.FOOTSTEP_SOUNDS[surfaceType].length-1);
    return Foot.prototype.FOOTSTEP_SOUNDS[surfaceType][index];
  }
}
Foot.prototype.downVector = vec3.fromValues(0,-1,0);
Foot.prototype.STEP_HEIGHT_READY = 0.185;
Foot.prototype.STEP_HEIGHT_COMPLETE = 0.185;
Foot.prototype.FOOTSTEP_SOUNDS = {"soft":['footstep0', 'footstep1', 'footstep2', 'footstep3'],"hard":['footstep4', 'footstep5']};
