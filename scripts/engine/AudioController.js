var SoundEngine = function () {
    'use strict';
    this.spacejam=new Howl({
        src:['assets/audio/SJTheme.wav'],
        volume: 0
    });
    this.ruready=new Howl({
        src:['assets/audio/RUReady.wav'],
        volume: 0
    });
    this.cruelangel=new Howl({
        src:['assets/audio/cruelangel.mp3'],
        volume: 0
    });
};

SoundEngine.prototype = {
    playSound2d: function (sound, volume=1) {
        let soundId=sound.play();
        sound.volume(volume,soundId);
        return [sound,soundId];
    },
    /*
     pannerObj is the object needed for the sound attenuation it has these parameters
     coneInnerAngle 360 There will be no volume reduction inside this angle.
     coneOuterAngle 360 The volume will be reduced to a constant value of coneOuterGain outside this angle.
     coneOuterGain 0 The amount of volume reduction outside of coneOuterAngle.
     distanceModel inverse Determines algorithm to use to reduce volume as audio moves away from listener. Can be linear, inverse or `exponential.
     maxDistance 10000 Volume won't reduce between source/listener beyond this distance.
     panningModel HRTF Determines which spatialization algorithm is used to position audio. Can be HRTF or equalpower.
     refDistance 1 A reference distance for reducing volume as the source moves away from the listener.
     rolloffFactor 1 How quickly the volume reduces as source moves from listener.
     */
    playSound3d: function (sound,panObj={panningModel:'HRTF',refDistance:0.8,rolloffFactor:2.5,distanceModel:'exponential'},x=0,y=0,z=0,volume=1) {
        let soundId=sound.play();
        sound.volume(volume,soundId);
        sound.pos(x,y,z,soundId);
        //sound roll off
        sound.pannerAttr(panObj,soundId);
        test=[sound,soundId];
        return [sound,soundId];
    },
    //the level has to be between 0.0. and 1.0
    changeVolume: function (soundId,level) {
        Howler.volume(level,soundId);
    },
    //rate is between 0.5 to 4.0 with 1 being the default speed
    changeRate: function (sound,soundId, rate) {
        sound.rate(rate,soundId);
    },
    //0 0 0 is the fucking middle
    //-1 is to the left on X
    //-1 is to the bottom on Y
    //-1 on Z who fucking knows
    updatePosition: function (sound, soundId,x=1,y=1,z=1) {
        sound.pos(x,y,z,soundId);

    },
    pauseSound:function (sound,soundId) {
        sound.pause(soundId);
    },
    resumeSound:function(sound,soundId){
        sound.play(soundId);
    },
    stopSound:function (sound,soundId) {
        sound.stop(soundId);
    },
    //loop boolean
    loopSound:function (sound,soundId,loop) {
        sound.loop(soundId,loop);
    }
};