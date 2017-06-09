/**
 * Created by Accipiter Chalybs on 6/4/2017.
 */

const PrefabFactory = {
  fsDecalNormal: null,

  init: function() {
    PrefabFactory.fsDecalColor = [new Texture("assets/texture/footstep/footstepL_color.png", true),
      new Texture("assets/texture/footstep/footstepR_color.png", true)];
    PrefabFactory.fsDecalNormal = [new Texture("assets/texture/footstep/footstepL_normal.png", false),
      new Texture("assets/texture/footstep/footstepR_normal.png", false)];
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
  }
};