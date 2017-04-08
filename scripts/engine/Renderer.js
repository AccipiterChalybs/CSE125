/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */

Renderer = new RendererEngine();

class RendererEngine //static class
{
    constructor(window_width, window_height) {
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



        this.width = 0;
        this.height = 0;

        this.view = null;
        this.perspective = null;


        this.currentShader = null;
        this.shaderList = [];
        this.shaderForwardLightList = [ FORWARD_PBR_SHADER, FORWARD_PBR_SHADER_ANIM ];
        this.shaderViewList = [ FORWARD_PBR_SHADER, FORWARD_PBR_SHADER_ANIM, EMITTER_SHADER, EMITTER_BURST_SHADER,
            PARTICLE_TRAIL_SHADER, DEFERRED_PBR_SHADER, DEFERRED_PBR_SHADER_ANIM, DEFERRED_SHADER_LIGHTING, SKYBOX_SHADER,
            SHADOW_SHADER, SHADOW_SHADER_ANIM, BASIC_SHADER, FORWARD_UNLIT, FORWARD_EMISSIVE ];
        this.shaderCameraPosList = [ FORWARD_PBR_SHADER, FORWARD_PBR_SHADER_ANIM, DEFERRED_SHADER_LIGHTING ];
        this.shaderEnvironmentList = [ FORWARD_PBR_SHADER, FORWARD_PBR_SHADER_ANIM, DEFERRED_SHADER_LIGHTING ];
        this.shaderPerspectiveList = [ FORWARD_PBR_SHADER, FORWARD_PBR_SHADER_ANIM, SKYBOX_SHADER, EMITTER_SHADER,
            EMITTER_BURST_SHADER, PARTICLE_TRAIL_SHADER, DEFERRED_PBR_SHADER, DEFERRED_PBR_SHADER_ANIM, DEFERRED_SHADER_LIGHTING,
            BASIC_SHADER, FORWARD_UNLIT, FORWARD_EMISSIVE ];

        this.camera = new Camera();
        this.prevFOV = 1;

        this.gpuData = {};

        this.lastTime = Time.time;

        this.fboTest = null;
        this.fboBlur = null;

        this.scene = null;

        this.skybox = null;

        this.passes = null;

        this.width = window_width;
        this.height = window_height;

        this.gpuData.vaoHandle = -1;

        //Set Enables
        GL.enable(GL.DEPTH_TEST);
        GL.enable(GL.CULL_FACE);
        GL.cullFace(GL.BACK);
        GL.clearColor(0, 0, 0, 1);
        GL.depthFunc(GL.LEQUAL); //needed for skybox to overwrite blank z-buffer values

        //TODO this might come by default with WEBGL 2?
        //GL.enable(GL.TEXTURE_CUBE_MAP_SEAMLESS);

        shaderList[FORWARD_PBR_SHADER_ANIM] = new Shader(
            "source/shaders/forward_pbr_skeletal.vert", "source/shaders/forward_pbr.frag"
        );


        shaderList[FORWARD_PBR_SHADER] = new Shader(
            "source/shaders/forward_pbr.vert", "source/shaders/forward_pbr.frag"
        );

        shaderList[DEFERRED_PBR_SHADER_ANIM] = new Shader(
            "source/shaders/forward_pbr_skeletal.vert", "source/shaders/deferred_gbuffer.frag"
        );


        shaderList[DEFERRED_PBR_SHADER] = new Shader(
            "source/shaders/forward_pbr.vert", "source/shaders/deferred_gbuffer.frag"
        );

        shaderList[DEFERRED_SHADER_LIGHTING] = new Shader(
            "source/shaders/deferred_lighting.vert", "source/shaders/deferred_lighting.frag"
        );

        shaderList[SKYBOX_SHADER] = new Shader(
            "source/shaders/skybox.vert", "source/shaders/skybox.frag"
        );

        shaderList[FBO_HDR] = new Shader(
            "source/shaders/fbo.vert", "source/shaders/fbo_hdr.frag"
        );

        shaderList[EMITTER_SHADER] = new Shader(
            "source/shaders/gpu_particle.vert", "source/shaders/gpu_particle.frag"
        );

        shaderList[EMITTER_BURST_SHADER] = new Shader(
            "source/shaders/gpu_particle_burst.vert", "source/shaders/gpu_particle.frag"
        );

        shaderList[PARTICLE_TRAIL_SHADER] = new Shader(
            "source/shaders/particle_trail.vert", "source/shaders/particle_trail.frag"
        );

        shaderList[SHADOW_SHADER] = new Shader(
            "source/shaders/forward_pbr.vert", "source/shaders/shadow.frag"
        );

        shaderList[SHADOW_SHADER_ANIM] = new Shader(
            "source/shaders/forward_pbr_skeletal.vert", "source/shaders/shadow.frag"
        );

        (*shaderList[SHADOW_SHADER])["uP_Matrix"] = DirectionalLight.shadowMatrix;
        (*shaderList[SHADOW_SHADER_ANIM])["uP_Matrix"] = DirectionalLight.shadowMatrix;

        shaderList[BASIC_SHADER] = new Shader(
            "source/shaders/simple.vert", "source/shaders/simple.frag"
        );

        shaderList[FORWARD_UNLIT] = new Shader(
            "source/shaders/forward_pbr.vert", "source/shaders/forward_unlit.frag"
        );
        shaderList[FORWARD_EMISSIVE] = new Shader(
            "source/shaders/forward_pbr.vert", "source/shaders/emissive.frag"
        );

        shaderList[FBO_BLUR] = new Shader(
            "source/shaders/fbo.vert", "source/shaders/fbo_blur.frag"
        );

        shaderList[FBO_PASS] = new Shader(
            "source/shaders/fbo.vert", "source/shaders/fbo_pass.frag"
        );

        currentShader = shaderList[FORWARD_PBR_SHADER];
        currentShader.use();

        let cubeFilenames = [
            "assets/skybox/right.hdr",
            "assets/skybox/left.hdr",
            "assets/skybox/top.hdr",
            "assets/skybox/bottom.hdr",
            "assets/skybox/front.hdr",
            "assets/skybox/back.hdr"];
        let skybox = new Skybox(cubeFilenames);
        skybox.applyIrradiance();
        skybox.applyTexture(5);

        this.scene = new GameScene();

        this.fboTest = new Framebuffer(width, height, 1, false, true);
        this.fboBlur = new Framebuffer(width / 2, height / 2, 2, false, true);

        this.resize(width, height);

        let regularPass = new ForwardPass();
        let particlePass = new ParticlePass();
        let shadowPass = new ShadowPass();
        let deferredPass = new DeferredPass();
        let bloomPass = new BloomPass(deferredPass);
        let skyboxPass = new SkyboxPass(skybox);

        this.passes = [];
        this.passes.push(shadowPass);
        this.passes.push(deferredPass);
        this.passes.push(skyboxPass);
        this.passes.push(regularPass);
        this.passes.push(particlePass);
        this.passes.push(bloomPass);

        lastTime = glfwGetTime();

    }


    //public
    init(width, height) {

    }

    loop () {

        applyPerFrameData();
        extractObjects();

        camera.update(Timer.deltaTime());
        if (camera.getFOV() != prevFOV)
        {
            prevFOV = camera.getFOV();
        }

        (*shaderList[SHADOW_SHADER])["uP_Matrix"] = DirectionalLight.shadowMatrix;
        (*shaderList[SHADOW_SHADER_ANIM])["uP_Matrix"] = DirectionalLight.shadowMatrix;
        glClear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);


        for(auto pass : passes)
        {
            if (pass == bloomPass) {
                auto job = workerPool.createJob(GameObject.UpdateScene).queue();
                pass.render();
                workerPool.wait(job);
            }
            else pass.render();
        }
    }

    //private
    _extractObjects() {
        renderBuffer.deferred.clear();
        renderBuffer.forward.clear();
        renderBuffer.particle.clear();
        renderBuffer.light.clear();
        GameObject.SceneRoot.extract();
    }

    _applyPerFrameData() {
        view = camera.getCameraMatrix();
        for (let shaderId of shaderViewList) {
            (*Renderer.getShader(shaderId))[VIEW_MATRIX] =view;
        }
        for (let shaderId of shaderCameraPosList) {
            (*Renderer.getShader(shaderId))["cameraPos"] = Renderer.camera.gameObject.transform.getWorldPosition();
        }
    }

    _updatePerspective(perspectiveMatrix) {
        perspective = perspectiveMatrix;
        for (let shaderId of shaderPerspectiveList) {
            (*Renderer.getShader(shaderId))["uP_Matrix"] = perspective;
        }
    }

    _setIrradiance(irradianceMatrix) {
        for (let shaderId of shaderEnvironmentList) {
            ((*Renderer.getShader(shaderId)))["irradiance[0]"] = irradianceMatrix[0];
            ((*Renderer.getShader(shaderId)))["irradiance[1]"] = irradianceMatrix[1];
            ((*Renderer.getShader(shaderId)))["irradiance[2]"] = irradianceMatrix[2];
        }
    }

    _setEnvironment(slot, mipmapLevels) {
        for (let shaderId of shaderEnvironmentList) {
            ((*Renderer.getShader(shaderId)))["environment"] = slot;
            ((*Renderer.getShader(shaderId)))["environment_mipmap"] = mipmapLevels;
        }
    }

    _setCurrentShader(shader) {
        currentShader = shader;
    }

    getCurrentShader () {
        return currentShader;
    }

    _getShader(shaderId) {
        return shaderList[shaderId];
    }

    switchShader(shaderId) {
        currentShader = shaderList[shaderId];
        currentShader.use()
    }

    setModelMatrix(transform) {
        currentShader[MODEL_MATRIX] = transform;
    }

    get windowWidth() {
        return this.width;
    }

    get widthHeight() {
        return this.height;
    }

    resize(width, height) {
        GL.viewport(0, 0, width, height);

        this.width = width;
        this.height = height;

        this.perspective = mat4.perspective(this.camera.getFOV(), width / eight, this.NEAR_DEPTH, this.FAR_DEPTH);
        this._updatePerspective(this.perspective);

    }

}