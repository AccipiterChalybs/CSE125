class AudioSource extends Component{
    constructor() {
        super();
        this.componentType = "AudioSource";
        //this.sound=SoundEngine.playSound3d(SoundEngine[name]);
        //sound is an array of [sound object, id]
        this.sound=null;
        this.sound3D=false;
    }
    update() {
        if(this.sound===null){
            //console.error("no sound has been set");
            return;
        }
        if(this.sound3D) {
            let emitterSrc = this.transform.getWorldPosition();
            SoundEngine.updatePosition(this.sound[0], this.sound[1], emitterSrc[0], emitterSrc[1], emitterSrc[2]);
        }
    }
    //bool name is the name of the sound, type is bool for 2d or 3d
    playSound2d(name){
        this.sound=SoundEngine.playSound2d(SoundEngine[name]);
    }
    playSound3d(name,panObj={panningModel:'HRTF',refDistance:0.8,rolloffFactor:2.5,distanceModel:'exponential'}){
        this.sound=SoundEngine.playSound3d(SoundEngine[name],panObj);
        this.sound3D=true;
    }
    changeVolume(volume){
        if(this.sound===null){
            console.error("no sound has been set");
            return;
        }
        SoundEngine.changeVolume(this.sound[1],volume);
    }
    pauseSound(){
        if(this.sound===null){
            console.error("no sound has been set");
            return;
        }
        SoundEngine.pauseSound(this.sound[0],this.sound[1]);
    }
    resumeSound(){
        if(this.sound===null){
            console.error("no sound has been set");
            return;
        }
        SoundEngine.resumeSound(this.sound[0],this.sound[1]);
    }
    stopSound(){
        if(this.sound===null){
            console.error("no sound has been set");
            return;
        }
        SoundEngine.stopSound(this.sound[0],this.sound[1]);
    }
    loopSound(){
        if(this.sound===null){
            console.error("no sound has been set");
            return;
        }
        SoundEngine.loopSound(this.sound[0],this.sound[1]);
    }
}