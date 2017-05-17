/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */

initRenderer = function (canvas) {
  Renderer.init(canvas, canvas.clientWidth, canvas.clientHeight);
};

const Renderer  = {
  init: function (canvas, windowWidth, windowHeight) {
      GLExtensions.init();

      Renderer.width = windowWidth;
      Renderer.height = windowHeight;

      Renderer.canvas = canvas;
      Renderer.shaderPath = "scripts/shaders/";
      Renderer.FORWARD_PBR_SHADER_ANIM = 0;
      Renderer.FORWARD_PBR_SHADER = 1;
      Renderer.SKYBOX_SHADER = 2;
      Renderer.FBO_HDR=3;
      Renderer.PARTICLE_SHADER=4;
      Renderer.DEFERRED_PBR_SHADER_ANIM=6;
      Renderer.DEFERRED_PBR_SHADER=7;
      Renderer.DEFERRED_SHADER_LIGHTING=8;
      Renderer.SHADOW_SHADER=9;
      Renderer.SHADOW_SHADER_ANIM=10;
      Renderer.POINT_SHADOW_SHADER=11;
      Renderer.POINT_SHADOW_SHADER_ANIM=12;
      Renderer.FORWARD_UNLIT = 13;
      Renderer.FBO_BLUR=15;
      Renderer.FBO_PASS=16;
      Renderer.FBO_AVERAGE=17;
      Renderer.FBO_DEBUG_CHANNEL=18;
      Renderer.FBO_COPY=19;
      Renderer.DEFERRED_DECAL=25;
      Renderer.MODEL_MATRIX = "uM_Matrix";
      Renderer.VIEW_MATRIX = "uV_Matrix";
      Renderer.PERSPECTIVE_MATRIX = "uP_Matrix";
      Renderer.NEAR_DEPTH = 0.2;
      Renderer.FAR_DEPTH = 1500;

      Renderer.FORWARD_SHADER_LIGHT_MAX = 5;

      Renderer.VERTEX_ATTRIB_LOCATION = 0;

      GL.enable(GL.DEPTH_TEST);
      GL.enable(GL.CULL_FACE);
      GL.cullFace(GL.BACK);
      GL.clearColor(0, 0, 0, 1);
      GL.depthFunc(GL.LEQUAL); //needed for skybox to overwrite blank z-buffer values

      Renderer.shaderForwardLightList = [Renderer.FORWARD_PBR_SHADER, Renderer.FORWARD_PBR_SHADER_ANIM];

      Renderer.shaderViewList = [Renderer.FORWARD_PBR_SHADER, Renderer.PARTICLE_SHADER, Renderer.FORWARD_UNLIT, Renderer.SKYBOX_SHADER, Renderer.FORWARD_PBR_SHADER_ANIM, Renderer.DEFERRED_PBR_SHADER, Renderer.DEFERRED_PBR_SHADER_ANIM,
        Renderer.DEFERRED_SHADER_LIGHTING, Renderer.SHADOW_SHADER, Renderer.SHADOW_SHADER_ANIM, Renderer.DEFERRED_DECAL];

      Renderer.shaderCameraPosList = [Renderer.FORWARD_PBR_SHADER, Renderer.FORWARD_PBR_SHADER_ANIM, Renderer.DEFERRED_SHADER_LIGHTING];

      Renderer.shaderEnvironmentList = [Renderer.FORWARD_PBR_SHADER, Renderer.FORWARD_PBR_SHADER_ANIM, Renderer.DEFERRED_SHADER_LIGHTING];

      Renderer.shaderPerspectiveList = [Renderer.FORWARD_PBR_SHADER, Renderer.FORWARD_PBR_SHADER_ANIM, Renderer.PARTICLE_SHADER, Renderer.SKYBOX_SHADER,
          Renderer.FORWARD_UNLIT, Renderer.DEFERRED_PBR_SHADER, Renderer.DEFERRED_PBR_SHADER_ANIM, Renderer.DEFERRED_SHADER_LIGHTING,
        Renderer.DEFERRED_DECAL
      ];
      /* Renderer.EMITTER_BURST_SHADER, Renderer.PARTICLE_TRAIL_SHADER,
            Renderer.BASIC_SHADER, Renderer.FORWARD_UNLIT, Renderer.FORWARD_EMISSIVE ];*/

      Renderer.shaderList = [];
      Renderer.shaderList[Renderer.FORWARD_PBR_SHADER_ANIM] = new Shader(
          Renderer.shaderPath + "forward_pbr_skeletal.vert", Renderer.shaderPath + "forward_pbr.frag"
      );
      Renderer.shaderList[Renderer.FORWARD_PBR_SHADER] = new Shader(
            Renderer.shaderPath + 'forward_pbr.vert', Renderer.shaderPath + 'forward_pbr.frag'
      );
      Renderer.shaderList[Renderer.SKYBOX_SHADER] = new Shader(
            Renderer.shaderPath + 'skybox.vert', Renderer.shaderPath + 'skybox.frag'
      );
      Renderer.shaderList[Renderer.FORWARD_UNLIT] = new Shader(
            Renderer.shaderPath + 'forward_pbr.vert', Renderer.shaderPath + 'forward_unlit.frag'
      );


      Renderer.shaderList[Renderer.PARTICLE_SHADER] = new Shader(
        Renderer.shaderPath + 'particle.vert', Renderer.shaderPath + 'particle.frag'
      );


      Renderer.shaderList[Renderer.DEFERRED_PBR_SHADER_ANIM] = new Shader(
        Renderer.shaderPath + "forward_pbr_skeletal.vert", Renderer.shaderPath + "deferred_gbuffer.frag"
      );


      Renderer.shaderList[Renderer.DEFERRED_PBR_SHADER] = new Shader(
        Renderer.shaderPath + "forward_pbr.vert", Renderer.shaderPath + "deferred_gbuffer.frag"
      );

      Renderer.shaderList[Renderer.DEFERRED_SHADER_LIGHTING] = new Shader(
        Renderer.shaderPath + "deferred_lighting.vert", Renderer.shaderPath + "deferred_lighting.frag"
      );

      Renderer.shaderList[Renderer.SHADOW_SHADER] = new Shader(
        Renderer.shaderPath + "forward_pbr.vert", Renderer.shaderPath + "shadow.frag"
      );

      Renderer.shaderList[Renderer.SHADOW_SHADER_ANIM] = new Shader(
        Renderer.shaderPath + "forward_pbr_skeletal.vert", Renderer.shaderPath + "shadow.frag"
      );


      Renderer.shaderList[Renderer.POINT_SHADOW_SHADER] = new Shader(
        Renderer.shaderPath + "forward_pbr.vert", Renderer.shaderPath + "shadowPoint.frag"
      );

      Renderer.shaderList[Renderer.POINT_SHADOW_SHADER_ANIM] = new Shader(
        Renderer.shaderPath + "forward_pbr_skeletal.vert", Renderer.shaderPath + "shadowPoint.frag"
      );



      Renderer.shaderList[Renderer.FBO_HDR] = new Shader(
          Renderer.shaderPath + "fbo.vert", Renderer.shaderPath + "fbo_hdr.frag"
      );

      Renderer.shaderList[Renderer.FBO_BLUR] = new Shader(
          Renderer.shaderPath + "fbo.vert", Renderer.shaderPath + "fbo_blur.frag"
      );

      Renderer.shaderList[Renderer.FBO_PASS] = new Shader(
          Renderer.shaderPath + "fbo.vert", Renderer.shaderPath + "fbo_pass.frag"
      );

      Renderer.shaderList[Renderer.FBO_AVERAGE] = new Shader(
          Renderer.shaderPath + "fbo.vert", Renderer.shaderPath + "fbo_average.frag"
      );

      Renderer.shaderList[Renderer.FBO_DEBUG_CHANNEL] = new Shader(
        Renderer.shaderPath + "fbo.vert", Renderer.shaderPath + "fbo_debug_channels.frag"
      );

      Renderer.shaderList[Renderer.FBO_COPY] = new Shader(
        Renderer.shaderPath + "fbo.vert", Renderer.shaderPath + "fbo_copy.frag"
      );



      Renderer.shaderList[Renderer.DEFERRED_DECAL] = new Shader(
        Renderer.shaderPath + "decal.vert", Renderer.shaderPath + "decal.frag"
      );

      Renderer.currentShader = null;
      Renderer.gpuData = {}; Renderer.gpuData.vaoHandle = -1;

      Renderer.camera = null;


      let skyboxName = 'assets/skybox/field/';
      let cubeFilenames = [
          'assets/skybox/' + skyboxName + 'right.hdr',
          'assets/skybox/' + skyboxName + 'left.hdr',
          'assets/skybox/' + skyboxName + 'top.hdr',
          'assets/skybox/' + skyboxName + 'bottom.hdr',
          'assets/skybox/' + skyboxName + 'front.hdr',
          'assets/skybox/' + skyboxName + 'back.hdr',
      ];
      //TODO should make a json file to load this with, and have exposure variable
      Renderer.skybox = new Skybox(skyboxName, (Debug.quickLoad)? 3 : 10);//TODO revert

      let shadowPass = new ShadowPass();
      let forwardPass = new ForwardPass();
      let skyboxPass = new SkyboxPass(Renderer.skybox);
      let particlePass = new ParticlePass();

      let decalPass = new DecalPass();

      Renderer.deferredPass = new DeferredPass();
      let deferredPrePass = new DeferredPrePass(Renderer.deferredPass);
      Renderer.postPass = new BloomPass(Renderer.deferredPass);

      Renderer.passes = [];
      Renderer.passes.push(shadowPass);
      Renderer.passes.push(deferredPrePass);
      Renderer.passes.push(decalPass);
      Renderer.passes.push(Renderer.deferredPass);
      Renderer.passes.push(forwardPass); //Note: This should usually go AFTER skybox, for transparent objects with no depth mask.
      Renderer.passes.push(skyboxPass);
      Renderer.passes.push(particlePass);
      Renderer.passes.push(Renderer.postPass);

      Renderer.renderBuffer = { forward: [], deferred: [], particle: [], light: [], decal: [] };

      GameEngine.finishLoadRequests();


      /*

        Renderer.shaderPath = "source/shaders/";

        Renderer.NEAR_DEPTH=0.2;
        Renderer.FAR_DEPTH=1500.;
        Renderer.MODEL_MATRIX = "uM_Matrix";
        Renderer.VIEW_MATRIX = "uV_Matrix";

        Renderer.SHADER_COUNT=17;
        Renderer.FORWARD_PBR_SHADER_ANIM=0;
        Renderer.FORWARD_PBR_SHADER=1;
        Renderer.SKYBOX_SHADER=2;
        Renderer.FBO_HDR=3;
        Renderer.EMITTER_SHADER=4;
        Renderer.EMITTER_BURST_SHADER=5;
        Renderer.DEFERRED_PBR_SHADER_ANIM=6;
        Renderer.DEFERRED_PBR_SHADER=7;
        Renderer.DEFERRED_SHADER_LIGHTING=8;
        Renderer.PARTICLE_TRAIL_SHADER=9;
        Renderer.SHADOW_SHADER=10;
        Renderer.SHADOW_SHADER_ANIM=11;
        Renderer.BASIC_SHADER=12;
        Renderer.FORWARD_UNLIT=13;
        Renderer.FORWARD_EMISSIVE=14;
        Renderer.FBO_BLUR=15;
        Renderer.FBO_PASS=16;

        Renderer.VERTEX_ATTRIB_LOCATION = 0;



        Renderer.renderBuffer = { forward: [], deferred: [], particle: [], light: [] };

        Renderer.currentShader=null;
        Renderer.camera=null;
        Renderer.gpuData=null;
        Renderer.passes=[];
        Renderer.perspective=null;
        Renderer.view=null;

        Renderer.width = 0;
        Renderer.height = 0;
        Renderer.prevFOV = 0;






        Renderer.FORWARD_PBR_SHADER = 0;

        Renderer.view = null;
        Renderer.perspective = null;


        Renderer.currentShader = null;
        Renderer.shaderList = [];
        Renderer.shaderForwardLightList = [ Renderer.FORWARD_PBR_SHADER, Renderer.FORWARD_PBR_SHADER_ANIM ];
        Renderer.shaderViewList = [ Renderer.FORWARD_PBR_SHADER, Renderer.FORWARD_PBR_SHADER_ANIM, Renderer.EMITTER_SHADER, Renderer.EMITTER_BURST_SHADER,
            Renderer.PARTICLE_TRAIL_SHADER, Renderer.DEFERRED_PBR_SHADER, Renderer.DEFERRED_PBR_SHADER_ANIM, Renderer.DEFERRED_SHADER_LIGHTING, Renderer.SKYBOX_SHADER,
            Renderer.SHADOW_SHADER, Renderer.SHADOW_SHADER_ANIM, Renderer.BASIC_SHADER, Renderer.FORWARD_UNLIT, Renderer.FORWARD_EMISSIVE ];
        Renderer.shaderCameraPosList = [ Renderer.FORWARD_PBR_SHADER, Renderer.FORWARD_PBR_SHADER_ANIM, Renderer.DEFERRED_SHADER_LIGHTING ];
        Renderer.shaderEnvironmentList = [ Renderer.FORWARD_PBR_SHADER, Renderer.FORWARD_PBR_SHADER_ANIM, Renderer.DEFERRED_SHADER_LIGHTING ];
        Renderer.shaderPerspectiveList = [ Renderer.FORWARD_PBR_SHADER, Renderer.FORWARD_PBR_SHADER_ANIM, Renderer.SKYBOX_SHADER, Renderer.EMITTER_SHADER,
            Renderer.EMITTER_BURST_SHADER, Renderer.PARTICLE_TRAIL_SHADER, Renderer.DEFERRED_PBR_SHADER, Renderer.DEFERRED_PBR_SHADER_ANIM, Renderer.DEFERRED_SHADER_LIGHTING,
            Renderer.BASIC_SHADER, Renderer.FORWARD_UNLIT, Renderer.FORWARD_EMISSIVE ];

        Renderer.camera = new Camera();
        Renderer.prevFOV = 1;

        Renderer.gpuData = {};
        Renderer.gpuData.vaoHandle = -1;

        Renderer.width = windowWidth;
        Renderer.height = windowHeight;

        //Set Enables
        GL.enable(GL.DEPTH_TEST);
        GL.enable(GL.CULL_FACE);
        GL.cullFace(GL.BACK);
        GL.clearColor(0, 0, 0, 1);
        GL.depthFunc(GL.LEQUAL); //needed for skybox to overwrite blank z-buffer values

        //TODO Renderer might come by default with WEBGL 2?
        //GL.enable(GL.TEXTURE_CUBE_MAP_SEAMLESS);

        Renderer.shaderList[Renderer.FORWARD_PBR_SHADER_ANIM] = new Shader(
            Renderer.shaderPath + "forward_pbr_skeletal.vert", Renderer.shaderPath + "forward_pbr.frag"
        );


        Renderer.shaderList[Renderer.FORWARD_PBR_SHADER] = new Shader(
            Renderer.shaderPath + "forward_pbr.vert", Renderer.shaderPath + "forward_pbr.frag"
        );

        Renderer.shaderList[Renderer.DEFERRED_PBR_SHADER_ANIM] = new Shader(
            Renderer.shaderPath + "forward_pbr_skeletal.vert", Renderer.shaderPath + "deferred_gbuffer.frag"
        );


        Renderer.shaderList[Renderer.DEFERRED_PBR_SHADER] = new Shader(
            Renderer.shaderPath + "forward_pbr.vert", Renderer.shaderPath + "deferred_gbuffer.frag"
        );

        Renderer.shaderList[Renderer.DEFERRED_SHADER_LIGHTING] = new Shader(
            Renderer.shaderPath + "deferred_lighting.vert", Renderer.shaderPath + "deferred_lighting.frag"
        );

        Renderer.shaderList[Renderer.SKYBOX_SHADER] = new Shader(
            Renderer.shaderPath + "skybox.vert", Renderer.shaderPath + "skybox.frag"
        );

        Renderer.shaderList[Renderer.FBO_HDR] = new Shader(
            Renderer.shaderPath + "fbo.vert", Renderer.shaderPath + "fbo_hdr.frag"
        );

        Renderer.shaderList[Renderer.EMITTER_SHADER] = new Shader(
            Renderer.shaderPath + "gpu_particle.vert", Renderer.shaderPath + "gpu_particle.frag"
        );

        Renderer.shaderList[Renderer.EMITTER_BURST_SHADER] = new Shader(
            Renderer.shaderPath + "gpu_particle_burst.vert", Renderer.shaderPath + "gpu_particle.frag"
        );

        Renderer.shaderList[Renderer.PARTICLE_TRAIL_SHADER] = new Shader(
            Renderer.shaderPath + "particle_trail.vert", Renderer.shaderPath + "particle_trail.frag"
        );

        Renderer.shaderList[Renderer.SHADOW_SHADER] = new Shader(
            Renderer.shaderPath + "forward_pbr.vert", Renderer.shaderPath + "shadow.frag"
        );

        Renderer.shaderList[Renderer.SHADOW_SHADER_ANIM] = new Shader(
            Renderer.shaderPath + "forward_pbr_skeletal.vert", Renderer.shaderPath + "shadow.frag"
        );

        Renderer.shaderList[Renderer.BASIC_SHADER] = new Shader(
            Renderer.shaderPath + "simple.vert", Renderer.shaderPath + "simple.frag"
        );

        Renderer.shaderList[Renderer.FORWARD_UNLIT] = new Shader(
            Renderer.shaderPath + "forward_pbr.vert", Renderer.shaderPath + "forward_unlit.frag"
        );
        Renderer.shaderList[Renderer.FORWARD_EMISSIVE] = new Shader(
            Renderer.shaderPath + "forward_pbr.vert", Renderer.shaderPath + "emissive.frag"
        );

        Renderer.shaderList[Renderer.FBO_BLUR] = new Shader(
            Renderer.shaderPath + "fbo.vert", Renderer.shaderPath + "fbo_blur.frag"
        );

        Renderer.shaderList[Renderer.FBO_PASS] = new Shader(
            Renderer.shaderPath + "fbo.vert", Renderer.shaderPath + "fbo_pass.frag"
        );

        Renderer.currentShader = Renderer.shaderList[Renderer.FORWARD_PBR_SHADER];
        Renderer.currentShader.use();

        let cubeFilenames = [
            "assets/skybox/right.hdr",
            "assets/skybox/left.hdr",
            "assets/skybox/top.hdr",
            "assets/skybox/bottom.hdr",
            "assets/skybox/front.hdr",
            "assets/skybox/back.hdr"];
        Renderer.skybox = new Skybox(cubeFilenames);
        Renderer.skybox.applyIrradiance();
        Renderer.skybox.applyTexture(5);

        //Renderer.scene = new GameScene();

        Renderer.fboTest = new Framebuffer(width, height, 1, false, true);
        Renderer.fboBlur = new Framebuffer(width / 2, height / 2, 2, false, true);

        Renderer.resize(width, height);

        let regularPass = new ForwardPass();
        let particlePass = new ParticlePass();
        let shadowPass = new ShadowPass();
        let deferredPass = new DeferredPass();
        let bloomPass = new BloomPass(deferredPass);
        let skyboxPass = new SkyboxPass(Renderer.skybox);

        Renderer.passes = [];
        Renderer.passes.push(shadowPass);
        Renderer.passes.push(deferredPass);
        Renderer.passes.push(skyboxPass);
        Renderer.passes.push(regularPass);
        Renderer.passes.push(particlePass);
        Renderer.passes.push(bloomPass);

        lastTime = Time.time();
*/
    },


  //Runs after everything is loaded, before loop
  start: function() {
      Renderer.skybox.applyTexture(5);
      Renderer.skybox.applyIrradiance();

      Renderer.perspective = mat4.create();
      Renderer.resize(Renderer.canvas.clientWidth, Renderer.canvas.clientHeight);

      Renderer.shaderList[Renderer.SHADOW_SHADER].setUniform("uP_Matrix", DirectionalLight.prototype.shadowMatrix, UniformTypes.mat4);
      Renderer.shaderList[Renderer.SHADOW_SHADER_ANIM].setUniform("uP_Matrix", DirectionalLight.prototype.shadowMatrix, UniformTypes.mat4);

      Renderer.getShader(Renderer.PARTICLE_SHADER).setUniform("tex", 0, UniformTypes.u1i);


      let s5 = Renderer.getShader(Renderer.FBO_DEBUG_CHANNEL);
      s5.setUniform("inputTex", 0, UniformTypes.u1i);
      s5.setUniform("cubeTex", 1, UniformTypes.u1i);
      s5.setUniform("face", 0, UniformTypes.u1i);

      Renderer.getShader(Renderer.DEFERRED_SHADER_LIGHTING).setUniform("colorTex", 0, UniformTypes.u1i);
      Renderer.getShader(Renderer.DEFERRED_SHADER_LIGHTING).setUniform("normalTex", 1, UniformTypes.u1i);
      Renderer.getShader(Renderer.DEFERRED_SHADER_LIGHTING).setUniform("posTex", 2, UniformTypes.u1i);
      Renderer.getShader(Renderer.DEFERRED_SHADER_LIGHTING).setUniform("shadowTex", 3, UniformTypes.u1i);
      Renderer.getShader(Renderer.DEFERRED_SHADER_LIGHTING).setUniform("shadowCube", 4, UniformTypes.u1i);

      Renderer.getShader(Renderer.DEFERRED_DECAL).setUniform("colourBuffer", 0, UniformTypes.u1i);
      Renderer.getShader(Renderer.DEFERRED_DECAL).setUniform("normalBuffer", 1, UniformTypes.u1i);
      Renderer.getShader(Renderer.DEFERRED_DECAL).setUniform("positionBuffer", 2, UniformTypes.u1i);
      Renderer.getShader(Renderer.DEFERRED_DECAL).setUniform("inputColorTex", 3, UniformTypes.u1i);
      Renderer.getShader(Renderer.DEFERRED_DECAL).setUniform("inputNormalTex", 4, UniformTypes.u1i);


      Renderer.getShader(Renderer.FBO_COPY).setUniform("inputTex1", 0, UniformTypes.u1i);
      Renderer.getShader(Renderer.FBO_COPY).setUniform("inputTex2", 1, UniformTypes.u1i);
      Renderer.getShader(Renderer.FBO_COPY).setUniform("inputTex3", 2, UniformTypes.u1i);
  },

  loop: function () {

        Renderer._applyPerFrameData();
        Renderer._extractObjects();


      //  Renderer.camera.update(Time.deltaTime());
        if (Renderer.camera.getFOV() !== Renderer.prevFOV)
        {
            Renderer.prevFOV = Renderer.camera.getFOV();
        }

/*
        Renderer.shaderList[Renderer.SHADOW_SHADER].setUniform(["uP_Matrix"],
        DirectionalLight.prototype.shadowMatrix, UniformTypes.mat4);
        Renderer.shaderList[Renderer.SHADOW_SHADER_ANIM].setUniform(["uP_Matrix"],
        DirectionalLight.prototype.shadowMatrix, UniformTypes.mat4);
*/

      //GL.clearColor(0.25, 0.5, 0.81, 1);
      GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

      if (Renderer.canvas.clientWidth  !== Renderer.width ||
        Renderer.canvas.clientHeight !== Renderer.height) {

        Renderer.resize(Renderer.canvas.clientWidth, Renderer.canvas.clientHeight);
      }

      for (let pass of Renderer.passes) {
        pass.render();
      }
    },

  //private
  _extractObjects: function () {
    Renderer.renderBuffer.deferred = [];
    Renderer.renderBuffer.forward = [];
    Renderer.renderBuffer.particle = [];
    Renderer.renderBuffer.light = [];
    if (Renderer.directionalLight) Renderer.renderBuffer.light.push(Renderer.directionalLight.getComponent("Light"));
    GameObject.prototype.SceneRoot.extract();
  },

  _applyPerFrameData: function () {
    let view = Renderer.camera.getCameraMatrix();
    for (let shaderId of Renderer.shaderViewList) {
      Renderer.getShader(shaderId).setUniform(Renderer.VIEW_MATRIX, view, UniformTypes.mat4);
    }

    for (let shaderId of Renderer.shaderCameraPosList) {
      Renderer.getShader(shaderId).setUniform("cameraPos",
          Renderer.camera.gameObject.transform.getWorldPosition(), UniformTypes.vec3);
    }

  },

  //TODO optimize this and switching FBOs
  _updatePerspective: function (perspectiveMatrix) {
    Renderer.perspective = perspectiveMatrix;
    for (let shaderId of Renderer.shaderPerspectiveList) {
      Renderer.getShader(shaderId).setUniform(Renderer.PERSPECTIVE_MATRIX, Renderer.perspective, UniformTypes.mat4);
    }
  },

  _setIrradiance: function (irradianceMatrix) {
    for (let shaderId of Renderer.shaderEnvironmentList) {
      Renderer.getShader(shaderId).setUniform('irradiance[0]', irradianceMatrix[0],
          UniformTypes.mat4);
      Renderer.getShader(shaderId).setUniform('irradiance[1]', irradianceMatrix[1],
          UniformTypes.mat4);
      Renderer.getShader(shaderId).setUniform('irradiance[2]', irradianceMatrix[2],
          UniformTypes.mat4);
    }
  },

  setEnvironment: function (slot, mipmapLevels) {
    for (let shaderId of Renderer.shaderEnvironmentList) {
      Renderer.getShader(shaderId).setUniform('environment', slot, UniformTypes.u1i);

      Renderer.getShader(shaderId).setUniform("environment_mipmap", mipmapLevels, UniformTypes.u1f);
    }
  },

  _setCurrentShader: function (shader) {
    Renderer.currentShader = shader;
  },

  getCurrentShader: function () {
    return Renderer.currentShader;
  },

  getShader: function (shaderId) {
    return Renderer.shaderList[shaderId];
  },

  switchShader: function (shaderId) {
    Renderer.currentShader = Renderer.shaderList[shaderId];
    Renderer.currentShader.use();
  },

  setModelMatrix: function (transform) {
    Renderer.currentShader.setUniform(Renderer.MODEL_MATRIX, transform, UniformTypes.mat4);
  },

  resize: function (width, height) {
    Renderer.canvas.width = width;
    Renderer.canvas.height = height;

    //TODO ensure viewport doesn't go over / can handle sizes over 4096 (e.g. multiple monitors)
    GL.viewport(0, 0, width, height);

    Renderer.width = width;
    Renderer.height = height;

    mat4.perspective(Renderer.perspective, Renderer.camera.getFOV(), width / height,
        Renderer.NEAR_DEPTH, Renderer.FAR_DEPTH);

    Renderer._updatePerspective(Renderer.perspective);
  },

  getWindowWidth: function() {
      return Renderer.width;
  },

  getWindowHeight: function() {
      return Renderer.height;
  }
};
