const SoundEngine = {

    init: function () {

        'use strict';
        SoundEngine.spacejam = new Howl({
            src: ['assets/audio/TestTheme.mp3'],
            volume: 0,
          });
        SoundEngine.ruready = new Howl({
            src: ['assets/audio/orch_horror.wav'],
            volume: 0,
          });
        SoundEngine.cruelangel = new Howl({
            src: ['assets/audio/cine_ambience.wav'],
            volume: 0,
          });
        SoundEngine.singTone00 = new Howl({
          src: ['assets/audio/tone.wav'],
          volume: 0,
          loop: true
        });
        SoundEngine.singTone01 = new Howl({
          src: ['assets/audio/tone.wav'],
          volume: 0,
          loop: true
        });
        SoundEngine.singTone02 = new Howl({
          src: ['assets/audio/tone.wav'],
          volume: 0,
          loop: true
        });
        SoundEngine.singTone03 = new Howl({
          src: ['assets/audio/tone.wav'],
          volume: 0,
          loop: true
        });
        SoundEngine.you_won = new Howl({
          src: ['assets/audio/you_won.mp3'],
          volume: 0,
          loop: true
        });
        SoundEngine.get_item = new Howl({
          src: ['assets/audio/get_item.mp3'],
          volume: 0,
        });
        SoundEngine.door_unlocked = new Howl({
          src: ['assets/audio/door_unlocked.mp3'],
          volume: 0,
        });
        SoundEngine.heal = new Howl({
          src: ['assets/audio/healmag.wav'],
          volume: 0,
        });
       },

    playSound2d: function (sound, volume=1) {
        let soundId = sound.play();
        sound.volume(volume, soundId);
        return [sound, soundId];
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
    playSound3d: function (sound, panObj={ panningModel: 'HRTF', refDistance: 0.8, rolloffFactor: 2.5, distanceModel: 'exponential' }, x=0, y=0, z=0, volume=1) {
        let soundId = sound.play();
        sound.volume(volume, soundId);
        sound.pos(x, y, z, soundId);
        //sound roll off
        sound.pannerAttr(panObj, soundId);
        //let test=[sound,soundId];
        return [sound, soundId];
      },
    //the level has to be between 0.0. and 1.0
    changeVolume: function (soundId, level) {
        Howler.volume(level, soundId);
      },
    //rate is between 0.5 to 4.0 with 1 being the default speed
    changeRate: function (sound, soundId, rate) {
        sound.rate(rate, soundId);
      },
    //0 0 0 is the middle
    //-1 is to the left on X
    //-1 is to the bottom on Y
    //-1 on Z not sure
    updatePosition: function (sound, soundId, x=1, y=1, z=1) {
        sound.pos(x, y, z, soundId);

      },

    pauseSound: function (sound, soundId) {
        sound.pause(soundId);
      },

    resumeSound: function (sound, soundId) {
        sound.play(soundId);
      },

    stopSound: function (sound, soundId) {
        sound.stop(soundId);
      },
    //loop boolean
    loopSound: function (sound, soundId, loop) {
        sound.loop(soundId, loop);
      },

    updateOrientation: function (sound, soundId, x=1, y=1, z=1) {
        sound.orientation(x, y, z, soundId);
      },
  };
