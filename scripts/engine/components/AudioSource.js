class AudioSource extends Component{
    constructor(name, type="2") {
        super();
        this.componentType = "AudioSource";
        this.sound=AudioEngine.playSound3d(AudioEngine[name]);
    }
    update() {
        let emitterSrc = this.transform.getWorldPosition();
        AudioEngine.updatePosition(this.sound[0],this.sound[1],emitterSrc[0],emitterSrc[1],emitterSrc[2]);
    }
}