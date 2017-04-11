/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */
class RenderPass
{
    render(){}
}

class ForwardPass extends RenderPass
{
    render(){
        let lightIndex = 0;
        //TODO sort lights by importance?
        /*TODO re-enable
        for (let l of Renderer.renderBuffer.light) {
            if (lightIndex > Renderer.FORWARD_SHADER_LIGHT_MAX) break;
            l.forwardPass(lightIndex++);
        }
        */
        for (let mesh of Renderer.renderBuffer.forward) {
            if(mesh.material.shader === Renderer.getShader(Renderer.FORWARD_UNLIT) || mesh.material.shader === Renderer.getShader(Renderer.FORWARD_EMISSIVE))
                GL.depthMask(false);

            mesh.material.bind();
            mesh.draw();

            if (mesh.material.shader === Renderer.getShader(Renderer.FORWARD_UNLIT) || mesh.material.shader === Renderer.getShader(Renderer.FORWARD_EMISSIVE))
                GL.depthMask(true);
        }
    }
}

class ParticlePass extends RenderPass
{
    render(){
        for (let mesh of Renderer.renderBuffer.particle) {
            mesh.draw();
        }
    }
}



class ShadowPass extends ForwardPass
{
    render(){
        GL.enable(GL.DEPTH_TEST);
        GL.depthMask(true);
        GL.disable(GL.BLEND);
        GL.enable(GL.CULL_FACE);
        GL.cullFace(GL.BACK);
        GL.disable(GL.STENCIL_TEST);

        for (let l of Renderer.renderBuffer.light) {
            let caster = l; //TODO check if right type of light (this was supposed to check = directional)
            if (!caster || !caster.shadowCaster) continue;
            caster.bindShadowMap();
            GL.drawBuffer([GL.NONE]);
            for (let mesh of Renderer.renderBuffer.deferred) {
                let mat = mesh.material;
                let s = null;
                if (mat.shader === Renderer.getShader(Renderer.DEFERRED_PBR_SHADER_ANIM)) s = Renderer.getShader(Renderer.SHADOW_SHADER_ANIM);
                else s = Renderer.getShader(Renderer.SHADOW_SHADER);
                if (s !== Renderer.currentShader) s.use();
                mesh.draw();
            }
        }
    }
}




///////////////////////////////////
class DeferredPass extends RenderPass
{
    constructor(){
        super();
        //TODO do we need to add a special Framebuffer thing here?
        this.fbo = new Framebuffer(Renderer.getWindowWidth, Renderer.getWindowHeight, 4, false, true);
        //this.fbo = new Framebuffer(Renderer.getWindowWidth(), Renderer.getWindowHeight(), [GL.RGBA8, GL.RGBA16, GL.RGBA16F, GL.RGBA16F], true);

        Renderer.getShader(Renderer.DEFERRED_SHADER_LIGHTING)["colorTex"] = 0;
        Renderer.getShader(Renderer.DEFERRED_SHADER_LIGHTING)["normalTex"] = 1;
        Renderer.getShader(Renderer.DEFERRED_SHADER_LIGHTING)["posTex"] = 2;
    }

    render(){
        GL.enable(GL.DEPTH_TEST);
        GL.depthMask(true);
        GL.disable(GL.BLEND);
        GL.enable(GL.CULL_FACE);
        GL.cullFace(GL.BACK);
        GL.disable(GL.STENCIL_TEST);

        let buffers = [ GL.COLOR_ATTACHMENT0, GL.COLOR_ATTACHMENT1, GL.COLOR_ATTACHMENT2 ];
        this.fbo.bind(buffers);
        for(let mesh of Renderer.renderBuffer.deferred)
        {
            mesh.material.bind();
            mesh.draw();
        }
        //CHECK_ERROR();

        Renderer.getShader(Renderer.DEFERRED_SHADER_LIGHTING).use();
        Renderer.getShader(Renderer.DEFERRED_SHADER_LIGHTING)["uScreenSize"] = vec2.create(Renderer.getWindowWidth(), Renderer.getWindowHeight());
        GL.depthMask(false);
        GL.stencilOpSeparate(GL.BACK, GL.KEEP, GL.INCR_WRAP, GL.KEEP);
        GL.stencilOpSeparate(GL.FRONT, GL.KEEP, GL.DECR_WRAP, GL.KEEP);
        GL.drawBuffer([GL.NONE, GL.NONE, GL.NONE, GL.COLOR_ATTACHMENT3]);
        GL.clear(GL.COLOR_BUFFER_BIT);

        this.fbo.bindTexture(0, 0);
        this.fbo.bindTexture(1, 1);
        this.fbo.bindTexture(2, 2);
        Renderer.getShader(Renderer.DEFERRED_SHADER_LIGHTING)["colorTex"] = 0;
        Renderer.getShader(Renderer.DEFERRED_SHADER_LIGHTING)["normalTex"] = 1;
        Renderer.getShader(Renderer.DEFERRED_SHADER_LIGHTING)["posTex"] = 2;
        Renderer.getShader(Renderer.DEFERRED_SHADER_LIGHTING)["shadowTex"] = 3;
        Renderer.getShader(Renderer.DEFERRED_SHADER_LIGHTING)["uIV_Matrix"] = Renderer.camera.gameObject.transform.getTransformMatrix();
        //CHECK_ERROR();

        for(let light of Renderer.renderBuffer.light) {
            let d = light; //TODO check if directional light
            if (!d)
            {
                GL.drawBuffers(GL.NONE);
                GL.disable(GL.CULL_FACE);
                GL.enable(GL.STENCIL_TEST);
                GL.enable(GL.DEPTH_TEST);
                GL.clear(GL.STENCIL_BUFFER_BIT);
                GL.stencilFunc(GL.ALWAYS, 0, 0);

                light.deferredPass(true);


                GL.stencilFunc(GL.NOTEQUAL, 0, 0xFF);
                GL.cullFace(GL.FRONT);
            }
            else
            {
                GL.cullFace(GL.BACK);
                GL.disable(GL.STENCIL_TEST);
                if(d.shadowCaster && d.fbo)
                {
                    d.fbo.bindDepthTexture(3);
                    //TODO is this the right inverse?
                    Renderer.getShader(Renderer.DEFERRED_SHADER_LIGHTING)["uShadow_Matrix"] = DeferredPass.bias * DirectionalLight.shadowMatrix * mat4.inverse(d.gameObject.transform.getTransformMatrix());
                }
            }

            GL.enable(GL.BLEND);
            GL.blendEquation(GL.FUNC_ADD);
            GL.blendFunc(GL.ONE, GL.ONE);
            GL.enable(GL.CULL_FACE);
            GL.disable(GL.DEPTH_TEST);
            GL.drawBuffers([GL.NONE, GL.NONE, GL.NONE, GL.COLOR_ATTACHMENT3]);

            light.deferredPass(false);
        }
        //CHECK_ERROR();
        GL.disable(GL.STENCIL_TEST);
        GL.disable(GL.DEPTH_TEST);
        GL.disable(GL.CULL_FACE);

        let currentEntry = Mesh.meshMap["Plane"];

        if (Renderer.gpuData.vaoHandle !== currentEntry.vaoHandle) {
            GL.bindVertexArray(currentEntry.vaoHandle);
            Renderer.gpuData.vaoHandle = currentEntry.vaoHandle;
        }

        Renderer.currentShader["uLightType"] = 3;
        Renderer.currentShader["uScale"] = 1;
        Renderer.currentShader["uLightPosition"] = vec3.create();
        Renderer.currentShader["uV_Matrix"] = mat4.create();
        Renderer.currentShader["uP_Matrix"] = mat4.create();
        GL.drawElements(GL.TRIANGLES, currentEntry.indexSize, GL.UNSIGNED_INT, 0);
        Renderer.currentShader["uV_Matrix"] = Renderer.view;
        Renderer.currentShader["uP_Matrix"] = Renderer.perspective;
        //CHECK_ERROR();

        // TODO : Render Ambient
        GL.enable(GL.DEPTH_TEST);
        GL.enable(GL.CULL_FACE);
        GL.depthMask(true);
        GL.cullFace(GL.BACK);
        GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);
    }
}

DeferredPass.prototype.bias = mat4.create(
    0.5, 0.0, 0.0, 0.0,
    0.0, 0.5, 0.0, 0.0,
    0.0, 0.0, 0.5, 0.0,
    0.5, 0.5, 0.5, 1.0);

class SkyboxPass extends RenderPass
{
    constructor(skybox){
        super();
        this.skybox = skybox;
    }

    render(){
        if (this.skybox && this.skybox !== null) { this.skybox.draw(); }
    }
}





////////////////////////////////
class BloomPass extends RenderPass
{
    constructor(deferred){
        super();
        this._deferredPass = deferred;

        this._brightPass = new Framebuffer(Renderer.getWindowWidth(), Renderer.getWindowHeight(), 1, false, true);
        this._blurBuffers = [];
        this._blurBuffers[0] = new Framebuffer(Renderer.getWindowWidth()  / 2, Renderer.getWindowHeight() / 2, 2, false, true);
        this._blurBuffers[1] = new Framebuffer(Renderer.getWindowWidth() / 4, Renderer.getWindowHeight() / 4, 2, false, true);
        this._blurBuffers[2] = new Framebuffer(Renderer.getWindowWidth()/ 8, Renderer.getWindowHeight() / 8, 2, false, true);
        this._blurBuffers[3] = new Framebuffer(Renderer.getWindowWidth() / 16, Renderer.getWindowHeight() / 16, 2, false, true);
        this._blurBuffers[4] = new Framebuffer(Renderer.getWindowWidth() / 32, Renderer.getWindowHeight() / 32, 2, false, true);
    }
    
    render() {
        let s1 = Renderer.getShader(Renderer.FBO_PASS);
        let s2 = Renderer.getShader(Renderer.FBO_BLUR);
        let s3 = Renderer.getShader(Renderer.FBO_HDR);
        this.deferredPass.fbo.unbind();

        let buffers = [ GL.COLOR_ATTACHMENT0, GL.COLOR_ATTACHMENT1, GL.COLOR_ATTACHMENT2, GL.COLOR_ATTACHMENT3 ];

        this.deferredPass.fbo.bindTexture(0, 3);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_NEAREST);
        GL.generateMipmap(GL.TEXTURE_2D);
        this._brightPass.bind(1, buffers[0]);
        s1.use();
        this.deferredPass.fbo.draw();
        //CHECK_ERROR();

        this._brightPass.unbind();
        s2.use();
        this._brightPass.bindTexture(0, 0);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_NEAREST);
        GL.generateMipmap(GL.TEXTURE_2D);

        //TODO work on this!
        for (let i = 0; i < 5; i++)
        {
            s2["level"] = (float)(i + 1);
            s2["width"] = (float)(Renderer.getWindowWidth() / pow(2, i + 1));
            s2["height"] = (float)(Renderer.getWindowHeight() / pow(2, i + 1));
            brightPass.bindTexture(0, 0);
            this._blurBuffers[i].bind( buffers[0]);
            s2["direction"] = glm.vec2(1, 0);
            this.deferredPass.fbo.draw();

            s2["level"] = 0;
            this._blurBuffers[i].bindTexture(0, 0);
            this._blurBuffers[i].bind([GL.NONE, buffers[1]] );
            s2["direction"] = glm.vec2(0, 1);
            this.deferredPass.fbo.draw();
        }

        this._blurBuffers[4].unbind();
        s3.use();
        //CHECK_ERROR();

        this.deferredPass.fbo.bindTexture(0, 3);
        this._blurBuffers[0].bindTexture(1, 1);
        this._blurBuffers[1].bindTexture(2, 1);
        this._blurBuffers[2].bindTexture(3, 1);
        this._blurBuffers[3].bindTexture(4, 1);
        this._blurBuffers[4].bindTexture(5, 1);
        s3["inputTex"] = 0;
        s3["addTex1"] = 1;
        s3["addTex2"] = 2;
        s3["addTex3"] = 3;
        s3["addTex4"] = 4;
        s3["addTex5"] = 5;
        this.deferredPass.fbo.draw();
        //CHECK_ERROR();
    }
}