const AudioEngine={
    soundArr: [],
    loadAudio: function(filename) {
        let loadId = GameEngine.registerLoading();
        JsonLoader.loadJSON(filename, AudioEngine.soundLoaded.bind(this, loadId));
    },
    soundLoaded: function(loadId, SoundList){
        //create new howl object for each specific sound item
        for(sound in SoundList){
            if(sound !== null) {
                AudioEngine.soundArr[sound] = new Howl({
                    src: [SoundList[sound].src],
                    volume: 1,
                    loop: SoundList[sound].loop
                });
                AudioEngine.soundArr[sound].G_SType = SoundList[sound].type;
                AudioEngine.soundArr[sound].G_SSpace = SoundList[sound].space;
            }
        }
        GameEngine.completeLoading(loadId);
    },
    init: function () {
        this.loadAudio('assets/audio/SoundList.json');
    },
    playSound2d: function (sound, volume=1) {
        let soundId= AudioEngine.soundArr[sound].play();
        AudioEngine.soundArr[sound].volume(soundId,volume);
        return [sound,soundId];
    },
    playSound3d: function (sound, volume=1, x=0, y=0, z=0, panObj={ panningModel: 'HRTF', refDistance: 0.8, rolloffFactor: 2.5, distanceModel: 'exponential' }) {
        let soundId= AudioEngine.soundArr[sound].play();
        AudioEngine.soundArr[sound].volume(soundId,volume);
        AudioEngine.soundArr[sound].pos(x, y, z, soundId);
        //Sound roll off
        AudioEngine.soundArr[sound].pannerAttr(panObj, soundId);
        return [sound, soundId];
    },
    setVolume: function (sound, soundId, volume=1) {
        AudioEngine.soundArr[sound].volume(volume,soundId);
    },
    setMasterVolume: function (volume=1) {
        Howler.volume(volume);
    },
    setRate: function (sound, soundId, rate=1) {
        AudioEngine.soundArr[sound].rate(rate, soundId);
    },
    setPosition:function (sound, soundId, x=0, y=0, z=0) {
        AudioEngine.soundArr[sound].pos(x, y, z, soundId);
    },
    setOrientation: function (sound, soundId, x=0, y=0, z=0) {
        AudioEngine.soundArr[sound].orientation(x, y, z, soundId);
    },
    setLoop:function (sound, soundId, loop=true) {
        AudioEngine.soundArr[sound].loop(loop, soundId);
    },
    //when restarted it plays from beginning
    stopAudio:function (sound, soundId) {
        AudioEngine.soundArr[sound].stop(soundId);
    },
    //when restarted sets it back to the last played spot
    pauseAudio:function (sound, soundId) {
        AudioEngine.soundArr[sound].pause(soundId);
    },
    resumeAudio:function (sound, soundId) {
        AudioEngine.soundArr[sound].play(soundId);
    }
};