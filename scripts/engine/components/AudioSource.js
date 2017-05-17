const AudioState = {
  noSound: 0,
  play2dSound: 1,
  play3dSound: 2,
  resume: 3,
  pause: 4,
};

class AudioSource extends Component{
  constructor() {
    super();
    this.componentType = 'AudioSource';
    //this.sound=SoundEngine.playSound3d(SoundEngine[name]);
    //sound is an array of [sound object, id]
    this.sound = null;
    this.sound3D = false;
    this.state = AudioState.noSound;
    this.frameSkip = 0;
  }

  start() {
    this.gameObject.addComponentToSerializeableList(this);
  }

  startClient() {
    this.gameObject.addComponentToSerializeableList(this);
  }

  updateComponentClient() {
    if (this.sound === null) {
      console.error('no sound has been set');
      return;
    }

    if (this.sound3D) {
      let emitterSrc = this.transform.getWorldPosition();
      SoundEngine.updatePosition(this.sound[0], this.sound[1], emitterSrc[0], emitterSrc[1], emitterSrc[2]);
    }

    switch (this.state){
      case AudioState.noSound:
        break;
      case AudioState.play2dSound:
        this.playSound2d(this.name);
        break;
      case AudioState.play3dSound:
        this.playSound3d(this.name, this.panObj);
        break;
      case AudioState.resume:
        this.resumeSound();
        break;
      case AudioState.pause:
        this.pauseSound();
        break;
    }
  }

  updateComponent() {
    switch (this.state) {
      case AudioState.play2dSound:
        if (!this.serializeDirty) {
          this.state = AudioState.noSound;
          this.serializeDirty = true;
        }

        break;
      case AudioState.play3dSound:
        if (!this.serializeDirty) {
          this.state = AudioState.noSound;
          this.serializeDirty = true;
        }

        break;
    }
    this.frameSkip++;
  }

  setState(state) {
    //TODO Change this to make sure no sound effects get delayed.
    if (this.frameSkip > 100) {
      this.frameSkip = 0;
      this.state = state;
      this.serializeDirty = true;
    }
  }

  //bool name is the name of the sound, type is bool for 2d or 3d
  playSound2d(name) {
    this.name = name;
    this.sound = SoundEngine.playSound2d(SoundEngine[name]);
  }

  playSound3d(name, panObj={ panningModel: 'HRTF', refDistance: 0.8, rolloffFactor: 2.5, distanceModel: 'exponential' }) {
    this.name = name;
    this.panObj = panObj;
    this.sound = SoundEngine.playSound3d(SoundEngine[name], panObj);
    this.sound3D = true;
  }

  changeVolume(volume) {
    if (this.sound === null) {
      console.error('no sound has been set');
      return;
    }

    SoundEngine.changeVolume(this.sound[1], volume);
  }

  pauseSound() {
    if (this.sound === null) {
      console.error('no sound has been set');
      return;
    }

    SoundEngine.pauseSound(this.sound[0], this.sound[1]);
  }

  resumeSound() {
    if (this.sound === null) {
      console.error('no sound has been set');
      return;
    }

    SoundEngine.resumeSound(this.sound[0], this.sound[1]);
  }

  stopSound() {
    if (this.sound === null) {
      console.error('no sound has been set');
      return;
    }

    SoundEngine.stopSound(this.sound[0], this.sound[1]);
  }

  loopSound() {
    if (this.sound === null) {
      console.error('no sound has been set');
      return;
    }

    SoundEngine.loopSound(this.sound[0], this.sound[1]);
  }

  updateOrientation(x, y, z) {
    if (this.sound === null) {
      console.error('no sound has been set');
      return;
    }

    SoundEngine.updateOrientation(this.sound[0], this.sound[1], x, y, z);
  }

  setRate(rate) {
    if (this.sound === null) {
      console.error('no sound has been set');
      return;
    }

    SoundEngine.changeRate(this.sound[0], this.sound[1], rate);
  }

  serialize() {
    if (this.serializeDirty) {
      let retVal = {};
      retVal.s = this.state;
      this.serializeDirty = false; // Dont know if need
      return retVal;
    }

    return null;
  }

  applySerializedData(data) {
    this.state = data.s;
  }
}
