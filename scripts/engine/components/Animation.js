/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */

/* TODO
 *   Currently does not support scale keyframes, but this might not be necessary
 */
class Animation extends Component
{

    constructor(params = {name: ''}) {
      super();
      this.componentType = "Animation";

      this.animationName = params.name;
      this._currentAnimationIndex = 0;
      this._currentTime = 0;
      this._playing = false;
      this._looping = false;
      this.rootAxisLocked = [true, true, false];
    }

    start() {
      //TODO this may be un-necessary / cause issues for some models, but may be needed for others to get initial pose
      let tmp = this._currentAnimationIndex;
      this._currentAnimationIndex = 0;

      let currentAnim = Animation.prototype._animData[this.animationName][this._currentAnimationIndex];
      for (let node of currentAnim.boneData) {
        this.boneMap[node.name].setPosition(Animation._interpolateKeyframes(node.keyframes.position, 0, node.isRoot));
        this.boneMap[node.name].setRotation(Animation._interpolateQuaternions(node.keyframes.rotation, 0));
        // node.object.scale = node.keyframes.scale[scaleIndex].second;
      }

      this._currentAnimationIndex = tmp;
    }

    play ( animation, loop, restart = false) {
        if (restart || animation !== this._currentAnimationIndex) {
          this._currentAnimationIndex = animation;
          this._currentTime = 0;
        }
        this._playing = true;
        this._looping = loop;
    }

    resume() {
      this._playing = true;
    }

    stop() {
        this._playing = false;
    }

    getAnimationData() {
        return Animation.prototype._animData[this.animationName][this._currentAnimationIndex].boneData;
    }

    updateComponent() {
        let double = false;
        let lastTime = this._currentTime;
        let currentAnim = Animation.prototype._animData[this.animationName][this._currentAnimationIndex];
        if (this._playing) {
            this._currentTime += currentAnim.tickrate*Time.deltaTime; //TODO update constant (maybe from JSON file's tickrate?)
            if (this._currentTime >= currentAnim.animationTime) {
                if (this._looping) {
                    this._currentTime -= currentAnim.animationTime;
                    double=true;
                }
                else {
                    this.stop();
                }
            }
        }


        for (let node of currentAnim.boneData) {
          if (node.isRoot) {
            let motion = vec3.create();
            let newPosition = null;
            if (double) {
              let lastPosition = Animation._interpolateKeyframes(node.keyframes.position, lastTime, node.isRoot);
              newPosition = Animation._interpolateKeyframes(node.keyframes.position, currentAnim.animationTime-0.1, node.isRoot);
              vec3.subtract(motion, newPosition, lastPosition);
              lastPosition = Animation._interpolateKeyframes(node.keyframes.position, 0, node.isRoot);
              newPosition = Animation._interpolateKeyframes(node.keyframes.position, this._currentTime, node.isRoot);
              vec3.add(motion, motion, vec3.subtract(vec3.create(), newPosition, lastPosition));
            } else {
              let lastPosition = Animation._interpolateKeyframes(node.keyframes.position, lastTime, node.isRoot);
              newPosition = Animation._interpolateKeyframes(node.keyframes.position, this._currentTime, node.isRoot);
              vec3.subtract(motion, newPosition, lastPosition);
            }
            for (let rootAxis=0; rootAxis<3; ++rootAxis) {
              if (this.rootAxisLocked[rootAxis]) {
                motion[rootAxis] = 0;
              } else {
                newPosition[rootAxis] = 0;
              }
            }

            //Root Motion (need to reapply this transform's transformations (i.e. rotation & scale)
            vec3.scale(motion, motion, this.transform.getScale()[0]);
            vec3.transformQuat(motion, motion, this.transform.rotation);
            this.transform.translate(motion);

            let body = this.gameObject.getComponent('Collider').body;

            body.position.x = this.transform.getWorldPosition()[0];
            body.position.y = this.transform.getWorldPosition()[1];
            body.position.z = this.transform.getWorldPosition()[2];

            //Non-Root Motion (i.e. locked axes)
            this.boneMap[node.name].setPosition(newPosition);

            this.boneMap[node.name].setRotation(Animation._interpolateQuaternions(node.keyframes.rotation, this._currentTime));
          } else {
            this.boneMap[node.name].setPosition(Animation._interpolateKeyframes(node.keyframes.position, this._currentTime, node.isRoot));
            this.boneMap[node.name].setRotation(Animation._interpolateQuaternions(node.keyframes.rotation, this._currentTime));
            // node.object.scale = node.keyframes.scale[scaleIndex].second;
          }
        }
    }

    link (loadingAcceleration) {
      this.boneMap = loadingAcceleration;
    }



    //data = pair(float, vec3)[]
    static _interpolateKeyframes(data, time, rescale) {
        let positionIndex = 0;
        let numPositions = data.length;
        let currentPosition = vec3.create();

        for (let index = numPositions -1; index >=0; --index) {
            if (data[index].first < time) {
                positionIndex = index;
                break;
            }
        }

        if (positionIndex + 1 < numPositions) {
            let t = (time - data[positionIndex].first) / (data[positionIndex + 1].first - data[positionIndex].first);
            vec3.lerp(currentPosition, data[positionIndex].second, data[positionIndex + 1].second, t);
        } else {
            vec3.copy(currentPosition, data[positionIndex].second);
        }

        if (rescale) {
          vec3.scale(currentPosition, currentPosition, 0.01);
        }

        return currentPosition;
    }

    static _interpolateQuaternions(data, time) {
        let rotationIndex = 0;
        let numRotations = data.length;
        let currentRotation = quat.create();
        for (let index = numRotations - 1; index >= 0; --index) {
            if (data[index].first < time) {
                rotationIndex = index;
                break;
            }
        }
        if (rotationIndex + 1 < numRotations) {
            let t = (time - data[rotationIndex].first) / (data[rotationIndex + 1].first - data[rotationIndex].first);
            quat.slerp(currentRotation, data[rotationIndex].second, data[rotationIndex + 1].second, t);
        }
        else {
            quat.copy(currentRotation, data[rotationIndex].second);
        }
        return currentRotation;
    }

    static _convertQuat(input) {
        let retVal = quat.create(); quat.set(retVal, input[1], input[2], input[3], input[0]);
        return retVal;
    }

    static _convertVec(input) {
        let retVal = vec3.create(); vec3.set(retVal, input[0], input[1], input[2]);
        return retVal;
    }

  static loadAnimationData(animName, scene, rootName, indexList) {
      if (!Animation.prototype._animData[animName]) {
        Animation.prototype._animData[animName] = [];
      }

      for (let a = 0; a < scene.animations.length; ++a) { //separate animations (e.g. run, jump)
        if (! (a in indexList)) {
          continue;
        }
        let animation = scene.animations[a];

        let currentAnimData = {boneData: [], animationTime: 0};

        let longestTime = 0;
        //channels correspond to nodes, i.e. bones
        for (let c = 0; c < animation.channels.length; ++c) {
          let channel = animation.channels[c];

          let name = channel.name;

          let newData = {};
          newData.name = name;
          newData.isRoot = (name === rootName);
          newData.keyframes = {position:[], rotation:[], scale:[]};
          for (let keyframe = 0; keyframe < channel.positionkeys.length; ++keyframe) {
            let pair = {first: channel.positionkeys[keyframe][0],  second:  Animation._convertVec(channel.positionkeys[keyframe][1])};
            newData.keyframes.position.push(pair);
          }

          for (let keyframe = 0; keyframe < channel.rotationkeys.length; ++keyframe) {
            let pair = {first: channel.rotationkeys[keyframe][0], second: Animation._convertQuat(channel.rotationkeys[keyframe][1])};
            newData.keyframes.rotation.push(pair);
          }

          for (let keyframe = 0; keyframe < channel.scalingkeys.length; ++keyframe) {
            let pair = {first: channel.scalingkeys[keyframe][0], second: Animation._convertVec(channel.scalingkeys[keyframe][1])};
            newData.keyframes.scale.push(pair);
          }

          if (newData.keyframes.position[newData.keyframes.position.length - 1].first > longestTime) longestTime = newData.keyframes.position[newData.keyframes.position.length - 1].first;
          if (newData.keyframes.rotation[newData.keyframes.rotation.length - 1].first > longestTime) longestTime = newData.keyframes.rotation[newData.keyframes.rotation.length - 1].first;
          if (newData.keyframes.scale[newData.keyframes.scale.length - 1].first > longestTime) longestTime = newData.keyframes.scale[newData.keyframes.scale.length - 1].first;

          currentAnimData.boneData.push(newData);

        }
        currentAnimData.animationTime = longestTime;
        currentAnimData.tickrate = animation.tickspersecond;
        Animation.prototype._animData[animName][indexList[a]]= currentAnimData;
      }
    }

}
Animation.prototype._animData = {};