/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */

/* TODO
 *   Currently does not support scale keyframes, but this might not be necessary
 */
class Animation extends Component
{

    constructor(name) {
      super();
      this.componentType = "Animation";

      this.animationName = name;
      this._currentAnimationIndex = 0;
      this._currentTime = 0;
      this._playing = false;
      this._looping = false;
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

    play ( animation, loop) {
        this._currentAnimationIndex = animation;
        this._currentTime = 0;
        this._playing = true;
        this._looping = loop;
    }

    stop() {
        this._playing = false;
    }

    getAnimationData() {
        return Animation.prototype._animData[this.animationName][this._currentAnimationIndex].boneData;
    }

    updateComponent() {
        let lastTime = this._currentTime;
        let currentAnim = Animation.prototype._animData[this.animationName][this._currentAnimationIndex];
        if (this._playing) {
            this._currentTime += currentAnim.tickrate*Time.deltaTime; //TODO update constant (maybe from JSON file's tickrate?)
            if (this._currentTime > currentAnim.animationTime) {
                if (this._looping) {
                    this._currentTime -= currentAnim.animationTime;
                    lastTime -= currentAnim.animationTime;
                }
                else {
                    this.stop();
                }
            }
        }


        for (let node of currentAnim.boneData) {
          if (node.isRoot) {
            let lastPosition = Animation._interpolateKeyframes(node.keyframes.position, lastTime, node.isRoot);
            let newPosition = Animation._interpolateKeyframes(node.keyframes.position, this._currentTime, node.isRoot);
            //this.boneMap[node.name].translate(vec3.subtract(vec3.create(), newPosition, lastPosition));
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
        let currentPosition = null;

        for (let index = numPositions -1; index >=0; --index) {
            if (data[index].first < time) {
                positionIndex = index;
                break;
            }
        }

        if (positionIndex + 1 < numPositions) {
            let t = (time - data[positionIndex].first) / (data[positionIndex + 1].first - data[positionIndex].first);
            currentPosition = vec3.create();
            vec3.lerp(currentPosition, data[positionIndex].second, data[positionIndex + 1].second, t);
        } else {
            currentPosition = data[positionIndex].second
        }

        if (rescale) {
          vec3.scale(currentPosition, currentPosition, 0.01);
        }

        return currentPosition;
    }

    static _interpolateQuaternions(data, time) {
        let rotationIndex = 0;
        let numRotations = data.length;
        let currentRotation = null;
        for (let index = numRotations - 1; index >= 0; --index) {
            if (data[index].first < time) {
                rotationIndex = index;
                break;
            }
        }
        if (rotationIndex + 1 < numRotations) {
            let t = (time - data[rotationIndex].first) / (data[rotationIndex + 1].first - data[rotationIndex].first);
            currentRotation = quat.create();
            quat.slerp(currentRotation, data[rotationIndex].second, data[rotationIndex + 1].second, t);
        }
        else {
            currentRotation = data[rotationIndex].second;
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

  static loadAnimationData(animName, scene, rootName) {
      Animation.prototype._animData[animName] = [];

      for (let a = 0; a < scene.animations.length; ++a) { //separate animations (e.g. run, jump)
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
        Animation.prototype._animData[animName].push(currentAnimData);
      }
    }

}
Animation.prototype._animData = {};