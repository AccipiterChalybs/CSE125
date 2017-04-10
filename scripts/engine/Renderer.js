/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */

let Renderer = null;

initRenderer = function(canvas) {
    Renderer = new RendererEngine(canvas);
    Renderer.init(canvas.clientWidth, canvas.clientHeight);

};

class RendererEngine //static class
{
    constructor(canvas) {
        this.canvas = canvas;
    }

    init(window_width, window_height) {

        this.shaderPath = "scripts/shaders/";
        this.SKYBOX_SHADER=2;
        this.NEAR_DEPTH=0.2;
        this.FAR_DEPTH=1500.;

        this.VERTEX_ATTRIB_LOCATION = 0;

        GL.enable(GL.DEPTH_TEST);
        GL.enable(GL.CULL_FACE);
        GL.cullFace(GL.BACK);
        GL.clearColor(0, 0, 0, 1);
        GL.depthFunc(GL.LEQUAL); //needed for skybox to overwrite blank z-buffer values

        this.shaderList=[];
        this.shaderList[this.SKYBOX_SHADER] = new Shader(
            this.shaderPath + "skybox.vert", this.shaderPath + "skybox.frag"
        );
        this.currentShader=null;
        this.gpuData = {}; this.gpuData.vaoHandle = -1;

        this.camera = new Camera();
        this.camera.gameObject = new GameObject();

        this.perspective = mat4.create();

        this.resize(window_width, window_height);


        let cubeFilenames = [
            "assets/skybox/right.hdr",
            "assets/skybox/left.hdr",
            "assets/skybox/top.hdr",
            "assets/skybox/bottom.hdr",
            "assets/skybox/front.hdr",
            "assets/skybox/back.hdr"];
        this.skybox = new Skybox(cubeFilenames);
        this.skybox.applyTexture(5);


        let skyboxPass = new SkyboxPass(this.skybox);

        this.passes = [];
        this.passes.push(skyboxPass);

        //TODO think this should be requestAnimationFrame or something like that
        setInterval(this.loop.bind(this), 20);

/*

        this.shaderPath = "source/shaders/";

        this.NEAR_DEPTH=0.2;
        this.FAR_DEPTH=1500.;

        this.SHADER_COUNT=17;
        this.FORWARD_PBR_SHADER_ANIM=0;
        this.FORWARD_PBR_SHADER=1;
        this.SKYBOX_SHADER=2;
        this.FBO_HDR=3;
        this.EMITTER_SHADER=4;
        this.EMITTER_BURST_SHADER=5;
        this.DEFERRED_PBR_SHADER_ANIM=6;
        this.DEFERRED_PBR_SHADER=7;
        this.DEFERRED_SHADER_LIGHTING=8;
        this.PARTICLE_TRAIL_SHADER=9;
        this.SHADOW_SHADER=10;
        this.SHADOW_SHADER_ANIM=11;
        this.BASIC_SHADER=12;
        this.FORWARD_UNLIT=13;
        this.FORWARD_EMISSIVE=14;
        this.FBO_BLUR=15;
        this.FBO_PASS=16;

        this.VERTEX_ATTRIB_LOCATIOB = 0;



        this.renderBuffer = { forward: [], deferred: [], particle: [], light: [] };

        this.currentShader=null;
        this.camera=null;
        this.gpuData=null;
        this.passes=[];
        this.perspective=null;
        this.view=null;

        this.width = 0;
        this.height = 0;
        this.prevFOV = 0;






        this.FORWARD_PBR_SHADER = 0;

        this.view = null;
        this.perspective = null;


        this.currentShader = null;
        this.shaderList = [];
        this.shaderForwardLightList = [ this.FORWARD_PBR_SHADER, this.FORWARD_PBR_SHADER_ANIM ];
        this.shaderViewList = [ this.FORWARD_PBR_SHADER, this.FORWARD_PBR_SHADER_ANIM, this.EMITTER_SHADER, this.EMITTER_BURST_SHADER,
            this.PARTICLE_TRAIL_SHADER, this.DEFERRED_PBR_SHADER, this.DEFERRED_PBR_SHADER_ANIM, this.DEFERRED_SHADER_LIGHTING, this.SKYBOX_SHADER,
            this.SHADOW_SHADER, this.SHADOW_SHADER_ANIM, this.BASIC_SHADER, this.FORWARD_UNLIT, this.FORWARD_EMISSIVE ];
        this.shaderCameraPosList = [ this.FORWARD_PBR_SHADER, this.FORWARD_PBR_SHADER_ANIM, this.DEFERRED_SHADER_LIGHTING ];
        this.shaderEnvironmentList = [ this.FORWARD_PBR_SHADER, this.FORWARD_PBR_SHADER_ANIM, this.DEFERRED_SHADER_LIGHTING ];
        this.shaderPerspectiveList = [ this.FORWARD_PBR_SHADER, this.FORWARD_PBR_SHADER_ANIM, this.SKYBOX_SHADER, this.EMITTER_SHADER,
            this.EMITTER_BURST_SHADER, this.PARTICLE_TRAIL_SHADER, this.DEFERRED_PBR_SHADER, this.DEFERRED_PBR_SHADER_ANIM, this.DEFERRED_SHADER_LIGHTING,
            this.BASIC_SHADER, this.FORWARD_UNLIT, this.FORWARD_EMISSIVE ];

        this.camera = new Camera();
        this.prevFOV = 1;

        this.gpuData = {};
        this.gpuData.vaoHandle = -1;

        this.width = window_width;
        this.height = window_height;

        //Set Enables
        GL.enable(GL.DEPTH_TEST);
        GL.enable(GL.CULL_FACE);
        GL.cullFace(GL.BACK);
        GL.clearColor(0, 0, 0, 1);
        GL.depthFunc(GL.LEQUAL); //needed for skybox to overwrite blank z-buffer values

        //TODO this might come by default with WEBGL 2?
        //GL.enable(GL.TEXTURE_CUBE_MAP_SEAMLESS);

        this.shaderList[this.FORWARD_PBR_SHADER_ANIM] = new Shader(
            this.shaderPath + "forward_pbr_skeletal.vert", this.shaderPath + "forward_pbr.frag"
        );


        this.shaderList[this.FORWARD_PBR_SHADER] = new Shader(
            this.shaderPath + "forward_pbr.vert", this.shaderPath + "forward_pbr.frag"
        );

        this.shaderList[this.DEFERRED_PBR_SHADER_ANIM] = new Shader(
            this.shaderPath + "forward_pbr_skeletal.vert", this.shaderPath + "deferred_gbuffer.frag"
        );


        this.shaderList[this.DEFERRED_PBR_SHADER] = new Shader(
            this.shaderPath + "forward_pbr.vert", this.shaderPath + "deferred_gbuffer.frag"
        );

        this.shaderList[this.DEFERRED_SHADER_LIGHTING] = new Shader(
            this.shaderPath + "deferred_lighting.vert", this.shaderPath + "deferred_lighting.frag"
        );

        this.shaderList[this.SKYBOX_SHADER] = new Shader(
            this.shaderPath + "skybox.vert", this.shaderPath + "skybox.frag"
        );

        this.shaderList[this.FBO_HDR] = new Shader(
            this.shaderPath + "fbo.vert", this.shaderPath + "fbo_hdr.frag"
        );

        this.shaderList[this.EMITTER_SHADER] = new Shader(
            this.shaderPath + "gpu_particle.vert", this.shaderPath + "gpu_particle.frag"
        );

        this.shaderList[this.EMITTER_BURST_SHADER] = new Shader(
            this.shaderPath + "gpu_particle_burst.vert", this.shaderPath + "gpu_particle.frag"
        );

        this.shaderList[this.PARTICLE_TRAIL_SHADER] = new Shader(
            this.shaderPath + "particle_trail.vert", this.shaderPath + "particle_trail.frag"
        );

        this.shaderList[this.SHADOW_SHADER] = new Shader(
            this.shaderPath + "forward_pbr.vert", this.shaderPath + "shadow.frag"
        );

        this.shaderList[this.SHADOW_SHADER_ANIM] = new Shader(
            this.shaderPath + "forward_pbr_skeletal.vert", this.shaderPath + "shadow.frag"
        );

        this.shaderList[this.SHADOW_SHADER].setUniform("uP_Matrix", DirectionalLight.shadowMatrix, UniformTypes.mat4);
        this.shaderList[this.SHADOW_SHADER_ANIM].setUniform("uP_Matrix", DirectionalLight.shadowMatrix, UniformTypes.mat4);

        this.shaderList[this.BASIC_SHADER] = new Shader(
            this.shaderPath + "simple.vert", this.shaderPath + "simple.frag"
        );

        this.shaderList[this.FORWARD_UNLIT] = new Shader(
            this.shaderPath + "forward_pbr.vert", this.shaderPath + "forward_unlit.frag"
        );
        this.shaderList[this.FORWARD_EMISSIVE] = new Shader(
            this.shaderPath + "forward_pbr.vert", this.shaderPath + "emissive.frag"
        );

        this.shaderList[this.FBO_BLUR] = new Shader(
            this.shaderPath + "fbo.vert", this.shaderPath + "fbo_blur.frag"
        );

        this.shaderList[this.FBO_PASS] = new Shader(
            this.shaderPath + "fbo.vert", this.shaderPath + "fbo_pass.frag"
        );

        this.currentShader = this.shaderList[this.FORWARD_PBR_SHADER];
        this.currentShader.use();

        let cubeFilenames = [
            "assets/skybox/right.hdr",
            "assets/skybox/left.hdr",
            "assets/skybox/top.hdr",
            "assets/skybox/bottom.hdr",
            "assets/skybox/front.hdr",
            "assets/skybox/back.hdr"];
        this.skybox = new Skybox(cubeFilenames);
        this.skybox.applyIrradiance();
        this.skybox.applyTexture(5);

        //this.scene = new GameScene();

        this.fboTest = new Framebuffer(width, height, 1, false, true);
        this.fboBlur = new Framebuffer(width / 2, height / 2, 2, false, true);

        this.resize(width, height);

        let regularPass = new ForwardPass();
        let particlePass = new ParticlePass();
        let shadowPass = new ShadowPass();
        let deferredPass = new DeferredPass();
        let bloomPass = new BloomPass(deferredPass);
        let skyboxPass = new SkyboxPass(this.skybox);

        this.passes = [];
        this.passes.push(shadowPass);
        this.passes.push(deferredPass);
        this.passes.push(skyboxPass);
        this.passes.push(regularPass);
        this.passes.push(particlePass);
        this.passes.push(bloomPass);

        lastTime = Time.time();
*/
    }

    loop () {
/*
        this._applyPerFrameData();
        this._extractObjects();

        this.camera.update(Time.deltaTime());
        if (this.camera.getFOV() !== this.prevFOV)
        {
            this.prevFOV = this.camera.getFOV();
        }


        this.shaderList[this.SHADOW_SHADER].setUniform(["uP_Matrix"], DirectionalLight.shadowMatrix, UniformTypes.mat4);
        this.shaderList[this.SHADOW_SHADER_ANIM].setUniform(["uP_Matrix"], DirectionalLight.shadowMatrix, UniformTypes.mat4);*/
        GL.clearColor(0.25,0.5,0.81,1);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
		Time.tick();

        if (this.canvas.clientWidth  !== this.width ||
            this.canvas.clientHeight !== this.height) {

            console.log(this.width);
            this.resize(this.canvas.clientWidth, this.canvas.clientHeight);
        }


        let dr = quat.create();
        let up = vec3.create(); vec3.set(up, 0, 1, 0);
        quat.setAxisAngle(dr, up, Time.deltaTime * 0.1);
        this.camera.gameObject.transform.rotate(dr);

        this.getShader(Renderer.SKYBOX_SHADER).setUniform("uV_Matrix", this.camera.getCameraMatrix(), UniformTypes.mat4);
        this.getShader(Renderer.SKYBOX_SHADER).setUniform("uP_Matrix", this.perspective, UniformTypes.mat4);

        for(let pass of this.passes)
        {
            pass.render();
        }
    }

    //private
    _extractObjects() {
        this.renderBuffer.deferred.clear();
        this.renderBuffer.forward.clear();
        this.renderBuffer.particle.clear();
        this.renderBuffer.light.clear();
        GameObject.prototype.SceneRoot.extract();
    }

    _applyPerFrameData() {
        let view = this.camera.getCameraMatrix();
        for (let shaderId of this.shaderViewList) {
            this.getShader(shaderId).setUniform(this.VIEW_MATRIX, view, UniformTypes.mat4);
        }
        for (let shaderId of this.shaderCameraPosList) {
            this.getShader(shaderId).setUniform("cameraPos", this.camera.gameObject.transform.getWorldPosition(), UniformTypes.vec3);
        }
    }

    _updatePerspective(perspectiveMatrix) {
        this.perspective = perspectiveMatrix;
        for (let shaderId of this.shaderPerspectiveList) {
            this.getShader(shaderId).setUniform("uP_Matrix", this.perspective, UniformTypes.mat4);
        }
    }

    _setIrradiance(irradianceMatrix) {
        for (let shaderId of this.shaderEnvironmentList) {
            this.getShader(shaderId).setUniform("irradiance[0]",irradianceMatrix[0], UniformTypes.mat4);
            this.getShader(shaderId).setUniform("irradiance[1]",irradianceMatrix[1], UniformTypes.mat4);
            this.getShader(shaderId).setUniform("irradiance[2]",irradianceMatrix[2], UniformTypes.mat4);
        }
    }

    setEnvironment(slot, mipmapLevels) {
       /* for (let shaderId of shaderEnvironmentList) {
            this.getShader(shaderId).setUniform("environment", slot, UniformTypes.u1i);

            //TODO: can we use mipmaps like this in WebGL?
            //this.getShader(shaderId).setUniform("environment_mipmap", mipmapLevels, UniformTypes.u1i);
        }*/
    }

    _setCurrentShader(shader) {
        this.currentShader = shader;
    }

    getCurrentShader () {
        return this.currentShader;
    }

    getShader(shaderId) {
        return this.shaderList[shaderId];
    }

    switchShader(shaderId) {
        this.currentShader = this.shaderList[shaderId];
        this.currentShader.use()
    }

    setModelMatrix(transform) {
        this.currentShader[this.MODEL_MATRIX] = transform;
    }

    get windowWidth() {
        return this.width;
    }

    get widthHeight() {
        return this.height;
    }

    resize(width, height) {
        console.log("W: "+width);
        this.canvas.width = width;
        this.canvas.height = height;
        //TODO ensure viewport doesn't go over / can handle sizes over 4096 (e.g. multiple monitors)
        GL.viewport(0, 0, width, height);

        this.width = width;
        this.height = height;

        mat4.perspective(this.perspective, this.camera.getFOV(), width / height, this.NEAR_DEPTH, this.FAR_DEPTH);
       // this._updatePerspective(this.perspective);

    }

}