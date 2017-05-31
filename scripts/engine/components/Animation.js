/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */

/* TODO
 *   Currently does not support scale keyframes, but this might not be necessary
 */
class Animation extends Component
{

    constructor({name}) {
      super();
      this.componentType = "Animation";

      this.animationName = name;
      this._currentAnimIndex = 0;
      this._currentTime = [];
      this._lastTime = [];
      this._playing = [];
      this._looping = [];
      this._animWeight = [];
      this.rootAxisLocked = [true, true, false];
      this.lastRootMotion = vec3.create();
    }

    start() {

      for (let i=0; i<Animation.prototype._animData[this.animationName].length; ++i) {
        this._currentTime[i] = 0;
        this._lastTime[i] = 0;
        this._playing[i] = false;
        this._looping[i] = false;
        this._animWeight[i] = 0;
      }

      //TODO this may be un-necessary / cause issues for some models, but may be needed for others to get initial pose
      let tmp = this._currentAnimIndex;
      this._currentAnimIndex = 0;

      let currentAnim = Animation.prototype._animData[this.animationName][this._currentAnimIndex];
      for (let node of currentAnim.boneData) {
        this.boneMap[node.name].setPosition(Animation._interpolateKeyframes(node.keyframes.position, 0, node.isRoot));
        this.boneMap[node.name].setRotation(Animation._interpolateQuaternions(node.keyframes.rotation, 0));
        // node.object.scale = node.keyframes.scale[scaleIndex].second;
      }

      this._currentAnimIndex = tmp;
    }

    play ( animation, loop, restart = false) {
        if (restart || animation !== this._currentAnimIndex) {
          this._currentAnimIndex = animation;
          this._currentTime[this._currentAnimIndex] = 0;
        }
        this._playing[this._currentAnimIndex] = true;
        this._looping[this._currentAnimIndex] = loop;
    }

    resume(index) {
      this._playing[index] = true;
    }

    stop(index) {
        this._playing[index] = false;
    }

    getAnimationData() {
        return Animation.prototype._animData[this.animationName][this._currentAnimIndex].boneData;
    }

    updateComponent() {
      let weightSum =0;
      for (let i=0; i<Animation.prototype._animData[this.animationName].length; ++i) {
        if (this._currentAnimIndex === i) {
          this._animWeight[i] += Animation.prototype.BLEND_RATE * Time.deltaTime;
          if (this._animWeight[i] > 1) this._animWeight[i] = 1;
        } else {
          this._animWeight[i] -= Animation.prototype.BLEND_RATE * Time.deltaTime;
          if (this._animWeight[i] < 0) this._animWeight[i] = 0;
        }


        if (this._animWeight[i] > 0) {
          this.updateAnim(i);
        }

        weightSum+=this._animWeight[i];
      }

      let animResults = {};
      let rootResults = vec3.create();

      for (let i = 0; i < Animation.prototype._animData[this.animationName].length; ++i) {
        for (let node of Animation.prototype._animData[this.animationName][i].boneData) {
          if (this._animWeight[i] > 0) {
            animResults[node.name] = animResults[node.name] || [vec3.create(), quat.create(), 0];
            let normalizedWeight = this._animWeight[i] / weightSum;

            let boneResults = this.getAnimData(node, i);
            vec3.scale(boneResults[0], boneResults[0], normalizedWeight);
            vec3.add(animResults[node.name][0], animResults[node.name][0], boneResults[0]);
            if (animResults[node.name][2] > 0) {
              quat.slerp(animResults[node.name][1], animResults[node.name][1], boneResults[1], normalizedWeight/(normalizedWeight+animResults[node.name][2]));
            } else {
              animResults[node.name][1] = boneResults[1];
            }

            if (node.isRoot) {
              vec3.add(rootResults, rootResults, vec3.scale(boneResults[2], boneResults[2], normalizedWeight));
            }
            animResults[node.name][2] += normalizedWeight;
          }
        }
      }


      for (let nodeName of Object.keys(animResults)) {
        this.boneMap[nodeName].setPosition(animResults[nodeName][0]);
        this.boneMap[nodeName].setRotation(animResults[nodeName][1]);
      }


      //Root Motion (need to reapply this transform's transformations (i.e. rotation & scale)
      vec3.scale(rootResults, rootResults, this.transform.getScale()[0]);
      vec3.transformQuat(rootResults, rootResults, this.transform.rotation);
      vec3.scale(rootResults, rootResults, -60);
  //    this.transform.translate(rootResults);

      let body = this.gameObject.getComponent('Collider').body;
/*
      body.position.x = this.transform.getWorldPosition()[0];
      body.position.y = this.transform.getWorldPosition()[1];
      body.position.z = this.transform.getWorldPosition()[2];
*/
      let tmp = vec3.copy(vec3.create(), rootResults);
      this.lastRootMotion = tmp;
      body.velocity.x *= 0.1;
      //body.velocity.y *= 0.1;
      body.velocity.z *= 0.1;

      body.velocity.x += rootResults[0];
      //body.velocity.y += rootResults[1];
      body.velocity.z += rootResults[2];
     //body.applyImpulse(new CANNON.Vec3(rootResults[0], rootResults[1],rootResults[2]), body.position);

    }


    updateAnim(index) {
      this._lastTime[index] = this._currentTime[index];
      let currentAnim = Animation.prototype._animData[this.animationName][index];
      if (this._playing[index]) {
        this._currentTime[index] += currentAnim.tickrate * Time.deltaTime; //TODO update constant (maybe from JSON file's tickrate?)
        if (this._currentTime[index] >= currentAnim.animationTime) {
          if (this._looping[index]) {
            this._currentTime[index] -= currentAnim.animationTime;
          }
          else {
            this.stop(index);
          }
        }
      }
    }

    getAnimData(node, index) {
      let currentAnim = Animation.prototype._animData[this.animationName][index];
      if (node.isRoot) {
        let motion = vec3.create();
        let newPosition = null;
        if (this._lastTime[index] > this._currentTime[index]) {
          let lastPosition = Animation._interpolateKeyframes(node.keyframes.position, this._lastTime[index], node.isRoot);
          newPosition = Animation._interpolateKeyframes(node.keyframes.position, currentAnim.animationTime-0.1, node.isRoot);
          vec3.subtract(motion, newPosition, lastPosition);
          lastPosition = Animation._interpolateKeyframes(node.keyframes.position, 0, node.isRoot);
          newPosition = Animation._interpolateKeyframes(node.keyframes.position, this._currentTime[index], node.isRoot);
          vec3.add(motion, motion, vec3.subtract(vec3.create(), newPosition, lastPosition));
        } else {
          let lastPosition = Animation._interpolateKeyframes(node.keyframes.position, this._lastTime[index], node.isRoot);
          newPosition = Animation._interpolateKeyframes(node.keyframes.position, this._currentTime[index], node.isRoot);
          vec3.subtract(motion, newPosition, lastPosition);
        }
        for (let rootAxis=0; rootAxis<3; ++rootAxis) {
          if (this.rootAxisLocked[rootAxis]) {
            motion[rootAxis] = 0;
          } else {
            newPosition[rootAxis] = 0;
          }
        }

        //Non-Root Motion (i.e. locked axes)
        return [newPosition,
                Animation._interpolateQuaternions(node.keyframes.rotation, this._currentTime[index]),
                motion];
      } else {
        return [Animation._interpolateKeyframes(node.keyframes.position, this._currentTime[index], node.isRoot),
                Animation._interpolateQuaternions(node.keyframes.rotation, this._currentTime[index])];
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
Animation.prototype.BLEND_RATE = 2.5;//TODO: should probably be property of animation