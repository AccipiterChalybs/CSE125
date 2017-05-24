const AudioState = {
    noSound: 0,
    playSound: 1,
    resume: 2,
    pause: 3,
};

class AudioSource extends Component {
    constructor(name) {
        super();
        this.componentType = 'AudioSource';
        this.state = AudioState.noSound;
        this.queue = [];
        this.sound3D = false;
        this.sound = null;
        if (AudioEngine.soundArr[name].G_SSpace === 3) {
            this.sound3D = true;
            this.sound = AudioEngine.playSound3d(name);
        } else {
            this.sound = AudioEngine.playSound2d(name);
        }
        AudioEngine.stopAudio(this.sound[0], this.sound[1])
    }

    //component and serilazation stuff
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
        if (this.queue.length > 0) {
            this.state = this.queue.shift();
        }
        switch (this.state) {
            case AudioState.noSound:
                break;
            case AudioState.playSound:
                //this.playSound3d(this.name, this.panObj);
                this.playSound();
                if (Debug.clientUpdate) this.state = AudioState.noSound;
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
        if(this.state===AudioState.playSound){
            if (!this.serializeDirty) {
                this.state = AudioState.noSound;
                this.serializeDirty = true;
            }
        }
    }

    setState(state) {
        //TODO Change this to make sure no sound effects get delayed.
        this.state = state;
        this.serializeDirty = true;
    }

    serialize() {
        if (this.serializeDirty) {
            let retVal = {};
            retVal.s = this.state;
            this.serializeDirty = false;
            return retVal;
        }
        return null;
    }

    applySerializedData(data) {
        this.queue.push(data.s);
    }

    //Sound Stuff
    playSound() {
        if (this.sound === null) {
            console.error('no sound has been set');
            return;
        }
        AudioEngine.resumeAudio(this.sound[0], this.sound[1]);
    }

    changeVolume(volume) {
        if (this.sound === null) {
            console.error('no sound has been set');
            return;
        }
        AudioEngine.setVolume(this.sound[0], this.sound[1],volume);
    }

    pauseSound() {
        if (this.sound === null) {
            console.error('no sound has been set');
            return;
        }
        AudioEngine.pauseAudio(this.sound[0], this.sound[1]);
    }

    stopSound() {
        if (this.sound === null) {
            console.error('no sound has been set');
            return;
        }
        AudioEngine.stopAudio(this.sound[0], this.sound[1]);
    }

    loopSound(loop) {
        if (this.sound === null) {
            console.error('no sound has been set');
            return;
        }
        AudioEngine.setLoop(this.sound[0], this.sound[1],loop);
    }

    updateOrientation(x, y, z) {
        if (this.sound === null) {
            console.error('no sound has been set');
            return;
        }

        AudioEngine.setOrientation(this.sound[0], this.sound[1], x, y, z);
    }

    setRate(rate) {
        if (this.sound === null) {
            console.error('no sound has been set');
            return;
        }

        AudioEngine.setRate(this.sound[0], this.sound[1], rate);
    }
}