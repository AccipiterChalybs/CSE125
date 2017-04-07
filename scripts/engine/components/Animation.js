/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */

/* TODO
 *   Currently does not support scale keyframes, but this might not be necessary
 */
class Animation extends Component
{

    constructor(scene, boneTransformMap) {
        super();
        this._animData = [];
        this._currentAnimationIndex = 0;
        this._currentTime = 0;
        this._playing = false;
        this._looping = false;

        for (let a = 0; a < scene.mNumAnimations; ++a) { //separate animations (e.g. run, jump)
            let animation = scene.mAnimations[a];

            let currentAnimData = {boneData: [], animationTime: 0};

            let longestTime = 0;
            //channels correspond to nodes, i.e. bones
            for (let c = 0; c < animation.mNumChannels; ++c) {
                let channel = animation.mChannels[c];

                let name = channel.mNodeName;

                let newData = {};
                newData.name = name;
                newData.object = boneTransformMap[name];
                newData.keyframes = {position:[], rotation:[], scale:[]};

                for (let keyframe = 0; keyframe < channel.mNumPositionKeys; ++keyframe) {
                    let pair = {first: channel.mPositionKeys[keyframe].mTime,  second:  Animation._convertVec(channel.mPositionKeys[keyframe].mValue};
                    newData.keyframes.position.push(pair);
                }

                for (let keyframe = 0; keyframe < channel.mNumRotationKeys; ++keyframe) {
                    let pair = {first: channel.mRotationKeys[keyframe].mTime, second: Animation._convertQuat(channel.mRotationKeys[keyframe].mValue)};
                    newData.keyframes.rotation.push(pair);
                }

                for (let keyframe = 0; keyframe < channel.mNumScalingKeys; ++keyframe) {
                    let pair = {first: channel.mScalingKeys[keyframe].mTime, second: Animation._convertVec(channel.mScalingKeys[keyframe].mValue)};
                    newData.keyframes.scale.push(pair);
                }

                if (newData.keyframes.position[newData.keyframes.position.length - 1].first > longestTime) longestTime = newData.keyframes.position[newData.keyframes.position.length - 1].first;
                if (newData.keyframes.rotation[newData.keyframes.rotation.length - 1].first > longestTime) longestTime = newData.keyframes.rotation[newData.keyframes.rotation.length - 1].first;
                if (newData.keyframes.scale[newData.keyframes.scale.length - 1].first > longestTime) longestTime = newData.keyframes.scale[newData.keyframes.scale.length - 1].first;

                currentAnimData.boneData.push(newData);

            }
            currentAnimData.animationTime = longestTime;
            this._animData.push(currentAnimData);
        }
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
        return this._animData[this._currentAnimationIndex].boneData;
    }

    update() {
        let currentAnim = this._animData[this._currentAnimationIndex];
        if (this._playing) {
            this._currentTime += Time.dt;
            if (this._currentTime > currentAnim.animationTime) {
                if (this._looping) {
                    this._currentTime -= currentAnim.animationTime;
                }
                else {
                    this.stop();
                }
            }
        }

        for (let node of currentAnim.boneData) {
            node.object.position = Animation._interpolateKeyframes(node.keyframes.position, this._currentTime);
            node.object.rotation = Animation._interpolateQuaternions(node.keyframes.rotation, this._currentTime);
            //node.object->scaleFactor = node.keyframes.scale[scaleIndex].second;
        }
    }



    //data = pair(float, vec3)[]
    static _interpolateKeyframes(data, time) {
        let positionIndex = 0;
        let numPositions = data.size();
        let currentPosition = null;

        for (let index = numPositions -1; index >=0; --index) {
            if (data[index].first < time) {
                positionIndex = index;
                break;
            }
        }

        if (positionIndex + 1 < numPositions) {
            let t = (time - data[positionIndex].first) / (data[positionIndex + 1].first - data[positionIndex].first);
            currentPosition = data[positionIndex].second * (1-t) + (t) * data[positionIndex + 1].second;
        } else {
            currentPosition = data[positionIndex].second
        }

        return currentPosition;
    }

    static _interpolateQuaternions(data, time) {
        let rotationIndex = 0;
        let numRotations = data.size();
        let currentRotation = null;
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
            currentRotation = data[rotationIndex].second;
        }
        return currentRotation;
    }

    static _convertQuat(input) {
        return quat.create(input.w, input.x, input.y, input.z);
    }

    static _convertVec(input) {
        return vec3.create(input.x, input.y, input.z);
    }

}