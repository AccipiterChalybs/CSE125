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
        for (let l of Renderer.renderBuffer.light) {
            if (lightIndex > Renderer.FORWARD_SHADER_LIGHT_MAX) break;
            l.forwardPass(lightIndex++);
        }

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
      GL.enable(GL.BLEND); //Blend function is specified on a per-particle system basis
      GL.depthMask(false);

      Renderer.switchShader(Renderer.PARTICLE_SHADER);

      for (let ps of Renderer.renderBuffer.particle) {
          ps.draw();
      }

      GL.depthMask(true);
      GL.disable(GL.BLEND);
    }
}

class DecalPass extends RenderPass
{

  constructor(deferredPassMain){
    super();
    //This is just because we can't render to textures in the bound FBO, and so need to copy them out of it.
    let width = Renderer.getWindowWidth();
    let height = Renderer.getWindowHeight();
    this.copyBuffers = new Framebuffer(width, height, 3, false, true, [GL.RGBA8, GL.RGBA16F, GL.RGBA16F]);

  }

  render() {
    //Copy over deferred buffers we need (due to above issue)
    Renderer.deferredPass.buffers.bindTexture(0, 0); //colour
    Renderer.deferredPass.buffers.bindTexture(1, 1); //normal
    Renderer.deferredPass.buffers.bindTexture(2, 2); //position
    this.copyBuffers.bind([GL.COLOR_ATTACHMENT0, GL.COLOR_ATTACHMENT1, GL.COLOR_ATTACHMENT2]);
    Renderer.switchShader(Renderer.FBO_COPY);
    Renderer.deferredPass.fbo.draw();

    this.copyBuffers.bindTexture(0, 0); //colour
    this.copyBuffers.bindTexture(1, 1); //normal
    this.copyBuffers.bindTexture(2, 2); //position

    Renderer.switchShader(Renderer.DEFERRED_DECAL);

    Renderer.currentShader.setUniform("uSizeZ", Decal.prototype.sizeZ, UniformTypes.u1f);

    //Bind deferred buffers to render to
    let buffers = [GL.COLOR_ATTACHMENT0, GL.COLOR_ATTACHMENT1, GL.COLOR_ATTACHMENT2];
    GL.bindFramebuffer(GL.FRAMEBUFFER, Renderer.deferredPass.buffers.id);
    GL.drawBuffers(buffers);

    //TODO should disable depth test incase camera is inside volume. Optimally, will disable / enable for each object.
    //TODO however, just keeping it on will be faster, and shouldn't matter if we keep our objects thin.
    GL.enable(GL.DEPTH_TEST);
    GL.depthMask(false);
    GL.enable(GL.CULL_FACE);

    for (let decal of Renderer.renderBuffer.decal) {
      decal.draw();
    }

    GL.depthMask(true);
  }
}



class ShadowPass extends ForwardPass
{
    render(){
        GL.enable(GL.DEPTH_TEST);
        GL.depthMask(true);
        GL.disable(GL.BLEND);
        GL.enable(GL.CULL_FACE);
        //TODO remove this later when we have new level geometry
        if (Debug.tmp_shadowTwoSideRender) {
          GL.disable(GL.CULL_FACE);
        }
        GL.cullFace(GL.BACK);
        GL.disable(GL.STENCIL_TEST);

        for (let l of Renderer.renderBuffer.light) {
            let caster = l;
            if (!caster || !caster.isShadowCaster) continue;
            if (caster.cubeShadow) {
              caster.prepShadowMap();
              for (let f=0; f<6; ++f) {
                caster.bindShadowMap(f);
                this._drawMeshes(true);
              }
            } else {
              caster.bindShadowMap(0);
              this._drawMeshes(false);
            }
        }
    }

    _drawMeshes(isPoint) {
      let animShader = (isPoint) ? Renderer.POINT_SHADOW_SHADER_ANIM : Renderer.SHADOW_SHADER_ANIM;
      let regShader = (isPoint) ? Renderer.POINT_SHADOW_SHADER : Renderer.SHADOW_SHADER;
      for (let mesh of Renderer.renderBuffer.deferred) {
        let mat = mesh.material;
        let s = null;
        if (mat.shader === Renderer.getShader(Renderer.DEFERRED_PBR_SHADER_ANIM)) s = Renderer.getShader(animShader);
        else s = Renderer.getShader(regShader);
        if (s !== Renderer.currentShader) {
          s.use();
        }
        mesh.draw();
      }
    }
}


class DeferredPrePass extends RenderPass
{

  constructor(deferredPassMain){
    super();
    this.buffers = deferredPassMain.buffers;
    this.fbo = deferredPassMain.fbo;
  }

  render() {
    GL.enable(GL.DEPTH_TEST);
    GL.depthMask(true);
    GL.disable(GL.BLEND);
    GL.enable(GL.CULL_FACE);
    GL.cullFace(GL.BACK);
    GL.disable(GL.STENCIL_TEST);

    let buffers = [GL.COLOR_ATTACHMENT0, GL.COLOR_ATTACHMENT1, GL.COLOR_ATTACHMENT2];
    this.buffers.bind(buffers);
    for (let mesh of Renderer.renderBuffer.deferred) {
      mesh.material.bind();
      mesh.draw();
    }
  }
}


///////////////////////////////////
class DeferredPass extends RenderPass
{
    constructor(){
        super();
        this.buffers = new Framebuffer(Renderer.getWindowWidth(), Renderer.getWindowHeight(), 3, false, true, [GL.RGBA8, GL.RGBA16F/*TODO should be RGBA16 - is this ok*/, GL.RGBA16F]);
        this.fbo = new Framebuffer(Renderer.getWindowWidth(), Renderer.getWindowHeight(), 1, false, true, [GL.RGBA16F]);
    }

    render(){

        //make sure prepass is done first!

        Renderer.getShader(Renderer.DEFERRED_SHADER_LIGHTING).use();
        let screenSize = vec2.create(); vec2.set(screenSize, Renderer.getWindowWidth(), Renderer.getWindowHeight());
        Renderer.getShader(Renderer.DEFERRED_SHADER_LIGHTING).setUniform("uScreenSize", screenSize, UniformTypes.vec2);
        GL.depthMask(false);
        GL.stencilOpSeparate(GL.BACK, GL.KEEP, GL.INCR_WRAP, GL.KEEP);
        GL.stencilOpSeparate(GL.FRONT, GL.KEEP, GL.DECR_WRAP, GL.KEEP);


        GL.bindFramebuffer(GL.FRAMEBUFFER, this.fbo.id);
        GL.drawBuffers([GL.COLOR_ATTACHMENT0]); //switch to rendering output, but keep depth from earlier
        GL.clear(GL.COLOR_BUFFER_BIT);
        GL.bindFramebuffer(GL.READ_FRAMEBUFFER, this.buffers.id);
        GL.blitFramebuffer(0, 0, this.fbo.width, this.fbo.height,
          0, 0, this.fbo.width, this.fbo.height,
                            GL.DEPTH_BUFFER_BIT,
                            GL.NEAREST);
        GL.bindFramebuffer(GL.READ_FRAMEBUFFER, null);


        this.buffers.bindTexture(0, 0);
        this.buffers.bindTexture(1, 1);
        this.buffers.bindTexture(2, 2);

        Renderer.getShader(Renderer.DEFERRED_SHADER_LIGHTING).setUniform("uIV_Matrix", Renderer.camera.gameObject.transform.getTransformMatrix(), UniformTypes.mat4);

        for(let light of Renderer.renderBuffer.light) {
            let d = light;
            if (!d.isShadowCaster || d.cubeShadow)
            {
                GL.drawBuffers([GL.NONE]);
                GL.disable(GL.CULL_FACE);
                GL.enable(GL.STENCIL_TEST);
                GL.enable(GL.DEPTH_TEST);
                GL.clear(GL.STENCIL_BUFFER_BIT);
                GL.stencilFunc(GL.ALWAYS, 0, 0);

                light.deferredPass(true);


                GL.stencilFunc(GL.NOTEQUAL, 0, 0xFF);
                GL.cullFace(GL.FRONT);

                if (d.isShadowCaster) {
                  d.fbo[0].bindCubeMapTexture(4);
                }
            }
            else //if directional light
            {
                GL.cullFace(GL.BACK);
                GL.disable(GL.STENCIL_TEST);
                if(d.isShadowCaster && d.fbo && !d.cubeShadow)
                {
                    d.fbo.bindDepthTexture(3);
                    let shadowMat = mat4.create();
                    mat4.invert(shadowMat, d.gameObject.transform.getTransformMatrix());
                    mat4.multiply(shadowMat, DirectionalLight.prototype.shadowMatrix, shadowMat);
                    mat4.multiply(shadowMat, DeferredPass.prototype.bias, shadowMat);

                    Renderer.getShader(Renderer.DEFERRED_SHADER_LIGHTING).setUniform("uShadow_Matrix", shadowMat, UniformTypes.mat4);
                }
            }

            GL.enable(GL.BLEND);
            GL.blendEquation(GL.FUNC_ADD);
            GL.blendFunc(GL.ONE, GL.ONE);
            GL.enable(GL.CULL_FACE);
            GL.disable(GL.DEPTH_TEST);
            GL.drawBuffers([GL.COLOR_ATTACHMENT0]); //switch back to main image

            light.deferredPass(false);
        }
        GL.disable(GL.STENCIL_TEST);
        GL.disable(GL.DEPTH_TEST);
        GL.disable(GL.CULL_FACE);


        let currentEntry = Mesh.prototype.meshMap["Plane"];

        if (Renderer.gpuData.vaoHandle !== currentEntry.vaoHandle) {
            GL.bindVertexArray(currentEntry.vaoHandle);
            Renderer.gpuData.vaoHandle = currentEntry.vaoHandle;
        }

        Renderer.currentShader.setUniform("uLightType", 3, UniformTypes.u1i);
        Renderer.currentShader.setUniform("uScale", 1, UniformTypes.u1f);
        Renderer.currentShader.setUniform("uLightPosition", vec3.create(), UniformTypes.vec3);
        Renderer.currentShader.setUniform("uV_Matrix", mat4.create(), UniformTypes.mat4);
        Renderer.currentShader.setUniform("uP_Matrix", mat4.create(), UniformTypes.mat4);
        GL.drawElements(GL.TRIANGLES, currentEntry.indexSize, GL.UNSIGNED_SHORT, 0);
        Renderer.currentShader.setUniform("uP_Matrix", Renderer.perspective, UniformTypes.mat4);


        // TODO : Render Ambient
        GL.enable(GL.DEPTH_TEST);
        GL.enable(GL.CULL_FACE);
        GL.depthMask(true);
        GL.cullFace(GL.BACK);
        GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);
    }
}

DeferredPass.prototype.bias = mat4.fromValues(
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

        this.averageExposure = 1;
        this._averageSize = 16;

        let screenWidth = Renderer.getWindowWidth();
        let screenHeight = Renderer.getWindowHeight();

        this._averagePass = new Framebuffer(this._averageSize, this._averageSize, 1, false, true);

        this._brightPass = new Framebuffer(screenWidth, screenHeight, 1, false, true);
        this._blurBuffers = [];
        this._blurBuffers[0] = [new Framebuffer(screenWidth  / 2, screenHeight / 2, 1, false, true),
                                 new Framebuffer(screenWidth  / 2, screenHeight / 2, 1, false, true)];
        this._blurBuffers[1] = [new Framebuffer(screenWidth / 4, screenHeight / 4, 1, false, true),
                                 new Framebuffer(screenWidth / 4, screenHeight / 4, 1, false, true)];
        this._blurBuffers[2] = [new Framebuffer(screenWidth/ 8, screenHeight / 8, 1, false, true),
                                 new Framebuffer(screenWidth/ 8, screenHeight / 8, 1, false, true)];
        this._blurBuffers[3] = [new Framebuffer(screenWidth / 16, screenHeight / 16, 1, false, true),
                                 new Framebuffer(screenWidth / 16, screenHeight / 16, 1, false, true)];
        this._blurBuffers[4] = [new Framebuffer(screenWidth / 32, screenHeight / 32, 1, false, true),
                                 new Framebuffer(screenWidth / 32, screenHeight / 32, 1, false, true)];
    }
    
    render() {
        let s1 = Renderer.getShader(Renderer.FBO_PASS);
        let s2 = Renderer.getShader(Renderer.FBO_BLUR);
        let s3 = Renderer.getShader(Renderer.FBO_HDR);
        let s4 = Renderer.getShader(Renderer.FBO_AVERAGE);
        this._deferredPass.fbo.unbind();

        let buffers = [ GL.COLOR_ATTACHMENT0, GL.COLOR_ATTACHMENT1, GL.COLOR_ATTACHMENT2, GL.COLOR_ATTACHMENT3 ];

        this._deferredPass.fbo.bindTexture(0, 0); //TODO use (0, 3)
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_NEAREST);
        GL.generateMipmap(GL.TEXTURE_2D);

        //Calculate Average Exposure for Eye Adjustment
        //(Have to render again to get highest mipmap since WebGL doesn't have getTexImage)
        const newDataWeight = 0.05;
        this._averagePass.bind([buffers[0]]);
        s4.use();
        this._deferredPass.fbo.draw();
        let currentRGB = new Float32Array(this._averageSize * this._averageSize * 4);
        GL.readPixels(0, 0, this._averageSize, this._averageSize, GL.RGBA, GL.FLOAT, currentRGB);
        let lumen = 0;

        for (let x=0; x<currentRGB.length; ++x) {
            if (isNaN(currentRGB[x])) {
                Debug.error("err" + x);
                currentRGB[x] = 1;
            }
        }

        for (let i=0; i<this._averageSize * this._averageSize; ++i) {
            lumen+=Math.sqrt(currentRGB[4*i]*currentRGB[4*i] + currentRGB[4*i+1]*currentRGB[4*i+1] + currentRGB[4*i+2]*currentRGB[4*i+2]);
        }
        lumen /= this._averageSize*this._averageSize;

        if (!isNaN(lumen)) {
            this.averageExposure = this.averageExposure * (1 - newDataWeight) + lumen * (newDataWeight);
        }
        //-----------------------------------------------------

        this._brightPass.bind([buffers[0]]);
        s1.use();
        this._deferredPass.fbo.draw();


        this._brightPass.unbind();
        s2.use();
        this._brightPass.bindTexture(0, 0);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_NEAREST);
        GL.generateMipmap(GL.TEXTURE_2D);


        for (let i = 0; i < 5; i++)
        {
            s2.setUniform("level", i + 1, UniformTypes.u1f);
            s2.setUniform("width", (Renderer.getWindowWidth() / Math.pow(2, i + 1)), UniformTypes.u1f);
            s2.setUniform("height", (Renderer.getWindowHeight() / Math.pow(2, i + 1)), UniformTypes.u1f);
            this._brightPass.bindTexture(0, 0);
            this._blurBuffers[i][0].bind([buffers[0]]);
            s2.setUniform("direction", new Float32Array([1, 0]), UniformTypes.vec2);
            this._deferredPass.fbo.draw();

            s2.setUniform("level", 0, UniformTypes.u1f);
            this._blurBuffers[i][0].bindTexture(0, 0);
            this._blurBuffers[i][1].bind([buffers[0]] );
            s2.setUniform("direction", new Float32Array([0, 1]), UniformTypes.vec2);
            this._deferredPass.fbo.draw();
        }
        this._blurBuffers[4][1].unbind();
        s3.use();

        this._deferredPass.fbo.bindTexture(0, 0); //TODO switch to (0, 3)
        this._blurBuffers[0][1].bindTexture(1, 0);
        this._blurBuffers[1][1].bindTexture(2, 0);
        this._blurBuffers[2][1].bindTexture(3, 0);
        this._blurBuffers[3][1].bindTexture(4, 0);
        this._blurBuffers[4][1].bindTexture(5, 0);
        s3.setUniform("inputTex", 0, UniformTypes.u1i);
        s3.setUniform("addTex1", 1, UniformTypes.u1i);
        s3.setUniform("addTex2", 2, UniformTypes.u1i);
        s3.setUniform("addTex3", 3, UniformTypes.u1i);
        s3.setUniform("addTex4", 4, UniformTypes.u1i);
        s3.setUniform("addTex5", 5, UniformTypes.u1i);

        s3.setUniform("exposure", this.averageExposure, UniformTypes.u1f);

        this._deferredPass.fbo.draw();


      if (Debug.bufferDebugMode) {
        let s5 = Renderer.getShader(Renderer.FBO_DEBUG_CHANNEL);
        switch (Debug.currentBuffer) {
          case Debug.BUFFERTYPE_PRE:
            this._deferredPass.fbo.blitFramebuffer(0, 0, 0, Renderer.getWindowWidth(), Renderer.getWindowHeight());
            break;
          case Debug.BUFFERTYPE_COLOUR:
            this._deferredPass.buffers.bindTexture(0, 0);
            s5.setUniform("rgbOutput", 1, UniformTypes.u1i);
            this._deferredPass.buffers.draw();
            break;
          case Debug.BUFFERTYPE_NORMAL:
            this._deferredPass.buffers.bindTexture(0, 1);
            s5.setUniform("rgbOutput", 1, UniformTypes.u1i);
            this._deferredPass.buffers.draw();
            break;
          case Debug.BUFFERTYPE_ROUGH:
            this._deferredPass.buffers.bindTexture(0, 2);
            s5.setUniform("rgbOutput", 0, UniformTypes.u1i);
            this._deferredPass.buffers.draw();
            break;
          case Debug.BUFFERTYPE_METAL:
            this._deferredPass.buffers.bindTexture(0, 1);
            s5.setUniform("rgbOutput", 0, UniformTypes.u1i);
            this._deferredPass.buffers.draw();
            break;
          case Debug.BUFFERTYPE_BLOOM:
            let abc = 0;
            for (let i = 0; i < 5; i++) {
              this._blurBuffers[i][1].blitFramebuffer(0, abc, 0, (Renderer.getWindowWidth() / Math.pow(2, i + 1)), (Renderer.getWindowHeight() / Math.pow(2, i + 1)));
              abc += (Renderer.getWindowWidth() / Math.pow(2, i + 1));
            }
            this._averagePass.blitFramebuffer(0, 0, 450, 50, 50);
            break;
          case Debug.BUFFERTYPE_SHADOW:
            let light = Renderer.renderBuffer.light[Debug.currentLightIndex];
            if (light.isShadowCaster) {
              if (light.cubeShadow) {
                let pos=0;
                light.fbo[0].bindCubeMapTexture(1);
                for (let f of [-1, -1, 3, -1, 4, 1, 5, 0, -1, -1, 2]) {
                  if (f===-1) { ++pos; continue; }
                  const displaySize = 256;
                  GL.viewport(displaySize*(pos%4), displaySize*Math.floor(pos/4), displaySize, displaySize); //render shadow map to a square-sized portion of the screen
                  s5.setUniform("cubeTex", 1, UniformTypes.u1i);
                  s5.setUniform("rgbOutput", 3, UniformTypes.u1i);
                  s5.setUniform("face", f, UniformTypes.u1i);
                  ++pos;
                  this._deferredPass.buffers.draw();
                }
              } else {
                light.fbo.bindDepthTexture(0);
                GL.viewport(0, 0, 512, 512); //render shadow map to a square-sized portion of the screen
                s5.setUniform("rgbOutput", 2, UniformTypes.u1i);
                this._deferredPass.buffers.draw();
              }
              GL.viewport(0, 0, Renderer.getWindowWidth(), Renderer.getWindowHeight()); //reset viewport
            }
            break;
          default:
            break;
        }
      }
    }
}