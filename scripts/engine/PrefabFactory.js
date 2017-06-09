/**
 * Created by Accipiter Chalybs on 6/4/2017.
 */

const PrefabFactory = {
  fsDecalNormal: null,
  tempParticles: [],

  init: function() {
    PrefabFactory.fsDecalColor = [new Texture("assets/texture/footstep/footstepL_color.png", true),
      new Texture("assets/texture/footstep/footstepR_color.png", true)];
    PrefabFactory.fsDecalNormal = [new Texture("assets/texture/footstep/footstepL_normal.png", false),
      new Texture("assets/texture/footstep/footstepR_normal.png", false)];
  },

  updateClient: function(){
    for(let i=0;i<PrefabFactory.tempParticles.length;i++){
      let tempParticle=  this.tempParticles[i];
      if (!tempParticle[0] || !tempParticle[0].components["ParticleSystem"]) continue;

      let alpha = 1-((Time.time - tempParticle[1]) / (tempParticle[2] - tempParticle[1]));
      vec4.set(tempParticle[0].components["ParticleSystem"].uColor ,1,1,1,alpha);

      if(tempParticle[2] < Time.time){
        tempParticle[0].components["ParticleSystem"] = null;
        GameObject.prototype.SerializeMap[tempParticle[0].id] = null;
        tempParticle[0].removeChildFromParent();
        PrefabFactory.tempParticles.splice(tempParticle,1);
      }
    }
  },

  makeFootstepDecal: function (leftFootStep) {
    let footIndex = (leftFootStep) ? 0 : 1;
    let footstepObject = new GameObject({clientSideOnly: true});
    let decal = new Decal({scale: 0.15, color: vec4.fromValues(1,1,1,1),
      texture: PrefabFactory.fsDecalColor[footIndex],
      normal: PrefabFactory.fsDecalNormal[footIndex]});

    footstepObject.addComponent(decal);

    //footstepObject.transform.rotateX(Math.PI/2.0);
    return footstepObject;
  },

  makeSplashParticleSystem: function() {
    let splashObject = new GameObject({clientSideOnly: true});

    return splashObject;
  },

  makeDustParticleSystem: function (temp = false,tempDuration = 1) {
    let dustParticle = new GameObject({clientSideOnly:true});
    if(!IS_SERVER)     dustParticle.addComponent(new ParticleSystem({additive: true, texture: particleTex,duration : [.5, 2.0],
      velocity : [[-.07, -.07, -.07],[.07,.07,.07]],
      startSize: [0.064, 0.128], endSize : [0.032, 0.064], gravity: .001, number: 1000,
      startColor: [[.5,.5,.5,0.25],[.5,.75,.5,0.25]], endColor: [[.5,.5,.5,0],[.5,.5,.5,0]]
    }));

    if(temp){
      PrefabFactory.tempParticles.push([dustParticle,Time.time, Time.time+tempDuration]);
    }

    return dustParticle;
  },
  makeFireParticleSystem: function (temp = false,tempDuration = 1) {
    let fireParticle = new GameObject({clientSideOnly:true});
    if(!IS_SERVER)     fireParticle.addComponent(new ParticleSystem({additive: true, texture: particleTex,duration : [.5, 2.5],
      velocity : [[-.05,-.05,-.05],[.05,.2,.05]],
      startSize: [0.032, 0.064], endSize : [0.000, 0.01], gravity: .075, number: 800,
      startColor: [[25,12,1,0.5],[25,25,1,0.5]], endColor: [[25,-5,-5,0],[25,-5,-5,0]]
    }));

    if(temp){
      PrefabFactory.tempParticles.push([fireParticle,Time.time, Time.time+tempDuration]);
    }

    return fireParticle;
  },

};