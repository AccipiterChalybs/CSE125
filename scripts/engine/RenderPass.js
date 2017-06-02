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
      Debug.Profiler.startTimer("ForwardPass", 2);
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
      Debug.Profiler.endTimer("ForwardPass", 2);
    }
}

class ParticlePass extends RenderPass
{
    render(){
      Debug.Profiler.startTimer("ParticlePass", 2);
      GL.enable(GL.BLEND); //Blend function is specified on a per-particle system basis
      GL.depthMask(false);

      Renderer.switchShader(Renderer.PARTICLE_SHADER);

      for (let ps of Renderer.renderBuffer.particle) {
          ps.draw();
      }

      GL.depthMask(true);
      GL.disable(GL.BLEND);
      Debug.Profiler.endTimer("ParticlePass", 2);
    }
}

class DecalPass extends RenderPass
{

  constructor(deferredPassMain){
    super();
    //This is just because we can't render to textures in the bound FBO, and so need to copy them out of it.
    //TODO maybe try editing the scale for faster speed?
    let decalBufferScale = 1;
    let width = Renderer.getWindowWidth() * decalBufferScale;
    let height = Renderer.getWindowHeight() * decalBufferScale;
    this.copyBuffers = new Framebuffer(width, height, 3, false, true, [GL.RGBA8, GL.RGBA16F, GL.RGBA16F]);

  }

  render() {
    Debug.Profiler.startTimer("DecalPass", 2);
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

    //TODO per obj
    Renderer.currentShader.setUniform("uSizeZ", Decal.prototype.sizeZ, UniformTypes.u1f);

    //Bind deferred buffers to render to
    let buffers = [GL.COLOR_ATTACHMENT0, GL.COLOR_ATTACHMENT1, GL.NONE, GL.COLOR_ATTACHMENT3];
    GL.bindFramebuffer(GL.FRAMEBUFFER, Renderer.deferredPass.buffers.id);
    GL.drawBuffers(buffers);
    GL.viewport(0,0,Renderer.deferredPass.buffers.width, Renderer.deferredPass.buffers.height);

    //TODO should disable depth test incase camera is inside volume. Optimally, will disable / enable for each object.
    //TODO however, just keeping it on will be faster, and shouldn't matter if we keep our objects thin.
    GL.enable(GL.DEPTH_TEST);
    GL.depthMask(false);
    GL.enable(GL.CULL_FACE);

    for (let decal of Renderer.renderBuffer.decal) {
      decal.draw();
    }

    GL.depthMask(true);
    Debug.Profiler.endTimer("DecalPass", 2);
  }
}



class ShadowPass extends ForwardPass
{

    bake() {
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

      let lightIndex = 0;
      for (let l of Renderer.renderBuffer.light) {
        let caster = l;
        if (!caster || !caster.isShadowCaster) continue;
        if (caster.cubeShadow) {
          caster.prepShadowMap(true);
          for (let f=0; f<6; ++f) {
            caster.bindShadowMap(f, true);
            this._drawMeshes(true, ShadowPass.prototype.MODE_STATIC);
          }
        } else {
          //No baking needed
        }
        lightIndex++;
      }
      Framebuffer.unbind();
    }

    render(){
      Debug.Profiler.startTimer("ShadowPass", 2);
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

        let lightIndex = 0;
        for (let l of Renderer.renderBuffer.light) {
            let caster = l;
            if (!caster || !caster.isShadowCaster) continue;
            if (caster.cubeShadow) {
              Debug.Profiler.startTimer("PointShadow "+lightIndex, 3);
              caster.prepShadowMap(false);
              for (let f=0; f<6; ++f) {
                caster.bindShadowMap(f, false);
                this._drawMeshes(true, caster.getShadowMode());
              }
              Debug.Profiler.endTimer("PointShadow "+lightIndex, 3);
            } else {
              Debug.Profiler.startTimer("DirShadow "+lightIndex, 3);
              caster.bindShadowMap(0, false);
              this._drawMeshes(false, ShadowPass.prototype.MODE_ALL);
              Debug.Profiler.endTimer("DirShadow "+lightIndex, 3);
            }
            lightIndex++;
        }
      Debug.Profiler.endTimer("ShadowPass", 2);
    }

    _drawMeshes(isPoint, mode) {
      let animShader = (isPoint) ? Renderer.POINT_SHADOW_SHADER_ANIM : Renderer.SHADOW_SHADER_ANIM;
      let regShader = (isPoint) ? Renderer.POINT_SHADOW_SHADER : Renderer.SHADOW_SHADER;
      let forwardShader = (isPoint) ? Renderer.FORWARD_POINT_SHADOW_SHADER : Renderer.FORWARD_SHADOW_SHADER;
      for (let mesh of Renderer.renderBuffer.deferred) {
        if (mode === ShadowPass.prototype.MODE_DYNAMIC && mesh.gameObject.isStatic) {
          continue;
        }
        if (mode === ShadowPass.prototype.MODE_STATIC && !mesh.gameObject.isStatic) {
          continue;
        }

        let mat = mesh.material;
        let s = null;
        if (mat.shader === Renderer.getShader(Renderer.DEFERRED_PBR_SHADER_ANIM)) s = Renderer.getShader(animShader);
        else s = Renderer.getShader(regShader);
        if (s !== Renderer.currentShader) {
          s.use();
        }
        mesh.draw();
      }
      for (let mesh of Renderer.renderBuffer.forward) {
        //TODO animated meshes
        let mat = mesh.material;
        if (mat.shader !== Renderer.getShader(Renderer.FORWARD_PBR_SHADER)) continue;
        if (mode === ShadowPass.prototype.MODE_DYNAMIC && mesh.gameObject.isStatic) {
          continue;
        }
        if (mode === ShadowPass.prototype.MODE_STATIC && !mesh.gameObject.isStatic) {
          continue;
        }
        mat._useTexture(MaterialTexture.COLOR, 0);
        let s = Renderer.getShader(forwardShader);
        if (s !== Renderer.currentShader) {
          s.use();
        }

        mesh.draw();
      }
    }
}
ShadowPass.prototype.MODE_ALL = 0;
ShadowPass.prototype.MODE_STATIC = 1;
ShadowPass.prototype.MODE_DYNAMIC = 2;


class DeferredPrePass extends RenderPass
{

  constructor(deferredPassMain){
    super();
    this.buffers = deferredPassMain.buffers;
    this.fbo = deferredPassMain.fbo;
  }

  render() {
    Debug.Profiler.startTimer("DeferredPrePass", 2);
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
    GL.drawBuffers([GL.NONE, GL.NONE, GL.NONE, GL.COLOR_ATTACHMENT3]);
    GL.clear(GL.COLOR_BUFFER_BIT);
    Debug.Profiler.endTimer("DeferredPrePass", 2);
  }
}


///////////////////////////////////
class DeferredPass extends RenderPass
{
    constructor(){
        super();
        this.buffers = new Framebuffer(Renderer.getWindowWidth(), Renderer.getWindowHeight(), 4, false, true, [GL.RGBA8, GL.RGBA16F, GL.RGBA16F, GL.RGBA16F], false, true);
        this.fbo = new Framebuffer(Renderer.getWindowWidth(), Renderer.getWindowHeight(), 1, false, true, [GL.RGBA16F], false, true);
    }

    render(){
      Debug.Profiler.startTimer("DeferredMainPass", 2);

        //make sure prepass is done first!

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


        let s5 = Renderer.getShader(Renderer.FBO_DEBUG_CHANNEL);
        s5.use();
        this.buffers.bindTexture(0, 3);
        s5.setUniform("rgbOutput", 1, UniformTypes.u1i);
        this.buffers.draw();
        //return;


        this.buffers.bindTexture(0, 0);
        this.buffers.bindTexture(1, 1);
        this.buffers.bindTexture(2, 2);

        GL.enable(GL.BLEND);
        GL.blendEquation(GL.FUNC_ADD);
        GL.blendFunc(GL.ONE, GL.ONE);

        for(let light of Renderer.renderBuffer.light) {
            let d = light;
            if (!d.isShadowCaster || d.cubeShadow)
            {
                Renderer.switchShader(Renderer.DEFERRED_SHADER_LIGHTING_POINT_PASS1);

                GL.drawBuffers([GL.NONE]);
                GL.disable(GL.CULL_FACE);
                GL.enable(GL.STENCIL_TEST);
                GL.enable(GL.DEPTH_TEST);
                GL.clear(GL.STENCIL_BUFFER_BIT);
                GL.stencilFunc(GL.ALWAYS, 0, 0);

                light.deferredPass(false);

                let currentPointShader = (d.isShadowCaster) ? Renderer.DEFERRED_SHADER_LIGHTING_POINT_SHADOW : Renderer.DEFERRED_SHADER_LIGHTING_POINT;
                Renderer.switchShader(currentPointShader);

                GL.stencilFunc(GL.NOTEQUAL, 0, 0xFF);
                GL.cullFace(GL.FRONT);

                if (d.isShadowCaster) {
                  d.bindCubeMap(4);
                }
            }
            else //if directional light
            {
                Renderer.switchShader(Renderer.DEFERRED_SHADER_LIGHTING_DIRECTIONAL_SHADOW);
                GL.cullFace(GL.BACK);
                GL.disable(GL.STENCIL_TEST);
                if(d.isShadowCaster && d.fbo && !d.cubeShadow)
                {
                    d.fbo.bindDepthTexture(3);
                    let shadowMat = mat4.create();
                    mat4.invert(shadowMat, d.gameObject.transform.getTransformMatrix());
                    mat4.multiply(shadowMat, DirectionalLight.prototype.shadowMatrix, shadowMat);
                    mat4.multiply(shadowMat, DeferredPass.prototype.bias, shadowMat);

                    Renderer.getShader(Renderer.DEFERRED_SHADER_LIGHTING_DIRECTIONAL_SHADOW).setUniform("uShadow_Matrix", shadowMat, UniformTypes.mat4);
                }
            }

            GL.disable(GL.DEPTH_TEST);
            GL.enable(GL.CULL_FACE);
            GL.drawBuffers([GL.COLOR_ATTACHMENT0]); //switch back to main image

            light.deferredPass(true);
        }
        GL.disable(GL.STENCIL_TEST);
        GL.disable(GL.CULL_FACE);


        Renderer.switchShader(Renderer.DEFERRED_SHADER_LIGHTING_ENVIRONMENT);

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
        Debug.Profiler.endTimer("DeferredMainPass", 2);
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
      Debug.Profiler.startTimer("SkyboxPass", 2);
        if (this.skybox && this.skybox !== null) { this.skybox.draw();
          Debug.Profiler.drawCall(); }
      Debug.Profiler.endTimer("SkyboxPass", 2);
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

        this.ssao_res = 0.5;
        this.ssao_blur_res = 0.5;
        this._ssaoBuffer = new Framebuffer(screenWidth * this.ssao_res, screenHeight * this.ssao_res, 1, false, false);
        this._ssaoBufferBlur = [new Framebuffer(screenWidth * this.ssao_blur_res, screenHeight * this.ssao_blur_res, 1, false, false),
          new Framebuffer(screenWidth * this.ssao_blur_res, screenHeight * this.ssao_blur_res, 1, false, false)];
    }
    
    render() {
      Debug.Profiler.startTimer("PostProcessingPass", 2);
        let s1 = Renderer.getShader(Renderer.FBO_PASS);
        let s2 = Renderer.getShader(Renderer.FBO_BLUR);
        let s3 = Renderer.getShader(Renderer.FBO_HDR);
        let s4 = Renderer.getShader(Renderer.FBO_AVERAGE);
        //Framebuffer.unbind(); //TODO don't think this line is needed

        let buffers = [ GL.COLOR_ATTACHMENT0, GL.COLOR_ATTACHMENT1, GL.COLOR_ATTACHMENT2, GL.COLOR_ATTACHMENT3 ];

        this._deferredPass.fbo.bindTexture(0, 0);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_NEAREST);
        GL.generateMipmap(GL.TEXTURE_2D);

        //Calculate Average Exposure for Eye Adjustment
        //(Have to render again to get highest mipmap since WebGL doesn't have getTexImage)
        const newDataWeight = 0.05;
        this._averagePass.bind([buffers[0]], false);
        s4.use();
        this._deferredPass.fbo.draw();
        let currentRGB = new Float32Array(this._averageSize * this._averageSize * 4);
        //TODO GL.readPixels(0, 0, this._averageSize, this._averageSize, GL.RGBA, GL.FLOAT, currentRGB);
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

        lumen=1; //TODO remove to re-enable expsoure adjustment
        if (!isNaN(lumen)) {
            this.averageExposure = this.averageExposure * (1 - newDataWeight) + lumen * (newDataWeight);
        }
        //-----------------------------------------------------

        this._brightPass.bind([buffers[0]], false);
        s1.use();
        this._deferredPass.fbo.draw();


        //TODO can I delete this? this._brightPass.unbind();
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
            this._blurBuffers[i][0].bind([buffers[0]], false);
            s2.setUniform("direction", new Float32Array([1, 0]), UniformTypes.vec2);
            this._deferredPass.fbo.draw();

            s2.setUniform("level", 0, UniformTypes.u1f);
            this._blurBuffers[i][0].bindTexture(0, 0);
            this._blurBuffers[i][1].bind([buffers[0]], false );
            s2.setUniform("direction", new Float32Array([0, 1]), UniformTypes.vec2);
            this._deferredPass.fbo.draw();
        }




      //SSAO--------------------------------
      let ssao = Renderer.getShader(Renderer.FBO_SSAO);
      ssao.use();
      this._ssaoBuffer.bind([buffers[0]], false);
      this._deferredPass.buffers.bindTexture(2, 2);
      ssao.setUniform('uScreenSize', vec2.fromValues(Renderer.getWindowWidth() * this.ssao_res, Renderer.getWindowHeight() * this.ssao_res), UniformTypes.vec2 );
      this._deferredPass.fbo.draw();

      s2.setUniform("level", 1, UniformTypes.u1f);
      s2.setUniform("width", (Renderer.getWindowWidth() * this.ssao_blur_res), UniformTypes.u1f);
      s2.setUniform("height", (Renderer.getWindowHeight() * this.ssao_blur_res), UniformTypes.u1f);
      this._ssaoBuffer.bindTexture(0, 0);
      this._ssaoBufferBlur[0].bind([buffers[0]], false);
      s2.setUniform("direction", new Float32Array([1, 0]), UniformTypes.vec2);
      this._deferredPass.fbo.draw();

      s2.setUniform("level", 1, UniformTypes.u1f);
      this._ssaoBufferBlur[0].bindTexture(0, 0);
      this._ssaoBufferBlur[1].bind([buffers[0]], false );
      s2.setUniform("direction", new Float32Array([0, 1]), UniformTypes.vec2);
      this._deferredPass.fbo.draw();

      //-------------------------------------


        Framebuffer.unbind();
        s3.use();

        this._deferredPass.fbo.bindTexture(0, 0);
        this._blurBuffers[0][1].bindTexture(1, 0);
        this._blurBuffers[1][1].bindTexture(2, 0);
        this._blurBuffers[2][1].bindTexture(3, 0);
        this._blurBuffers[3][1].bindTexture(4, 0);
        this._blurBuffers[4][1].bindTexture(5, 0);
        this._ssaoBufferBlur[1].bindTexture(6, 0);

        s3.setUniform("exposure", this.averageExposure, UniformTypes.u1f);

        this._deferredPass.fbo.draw();


      if (Debug.bufferDebugMode) {
        let s5 = Renderer.getShader(Renderer.FBO_DEBUG_CHANNEL);
        Renderer.DEFERRED_SHADER_LIGHTING_POINT = Renderer.DEFERRED_SHADER_LIGHTING_POINT_NORMAL; //reset if not set (e.g. in 8)

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
            this._deferredPass.buffers.bindTexture(0, 3);
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
                light.bindCubeMap(4);
                for (let f of [-1, -1, 3, -1, 4, 1, 5, 0, -1, -1, 2]) {
                  if (f===-1) { ++pos; continue; }
                  const displaySize = 256;
                  GL.viewport(displaySize*(pos%4), displaySize*Math.floor(pos/4), displaySize, displaySize); //render shadow map to a square-sized portion of the screen
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
            Renderer.DEFERRED_SHADER_LIGHTING_POINT = Renderer.DEFERRED_SHADER_LIGHTING_POINT_DEBUG;
            break;
          case Debug.BUFFERTYPE_SSAO:
            this._ssaoBufferBlur[1].bindTexture(0, 0);
            s5.setUniform("rgbOutput", 1, UniformTypes.u1i);
            this._deferredPass.buffers.draw();
            break;
          default:
            break;
        }
      }
      Debug.Profiler.endTimer("PostProcessingPass", 2);
    }
}