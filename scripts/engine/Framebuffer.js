/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */

//TODO convert to webgl 2.0

class Framebuffer {

    constructor(w, h, numColorTexture, accessibleDepth, hdrEnabled, colorFormats = null, manualSetup = false) {
        //this.id = 0;
        this.accessibleDepth = accessibleDepth;
        //this.colorTex = [];
        this.numColorTex = numColorTexture;
        this.depthTex = 0;

        this.hdrEnabled = hdrEnabled;
        this.width = w;
        this.height = h;

        //static meshdata
        //static bool loaded

        this.id = GL.createFramebuffer();
        GL.bindFramebuffer(GL.FRAMEBUFFER, this.id);


          this.colorTex = [];
          this.colorFormats = colorFormats;
          if (colorFormats === null) {
            this.colorFormats = [];
            for (let x = 0; x < this.numColorTex; ++x) {
              this.colorFormats[x] = (this.hdrEnabled) ? GL.RGBA16F : GL.RGBA;
            }
          }

        if (!manualSetup) {
          for (let x = 0; x < this.numColorTex; ++x) {
            this._addColorTexture(x);
          }

          if (this.accessibleDepth) {
            this._addDepthTexture();
          } else {
            this._addDepthBuffer();
          }

          GL.bindFramebuffer(GL.FRAMEBUFFER, null);
        }
    }

    deleteTextures() {
        for (let t=0; t<this.numColorTex; ++t) {
            GL.deleteTextures(this.colorTex[t]);
        }
        if (this.accessibleDepth) {
            GL.deleteTextures(this.depthTex);
        } else {
            GL.deleteRenderbuffer(this.depthTex);
        }
    }

    resize(w, h) {
        this.width = w;
        this.height = h;

        this.deleteTextures();

        GL.bindFramebuffer(GL.FRAMEBUFFER, this.id);
        for (let x = 0; x < this.numColorTex; ++x) {
            this._addColorTexture(x);
        }

        if (this.accessibleDepth) {
            this._addDepthTexture();
        } else {
            this._addDepthBuffer();
        }
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
    }

    //note buffersToDraw should be an array of COLOR_ATTACHMENTX
    bind(buffersToDraw) {
        GL.bindFramebuffer(GL.FRAMEBUFFER, this.id);
        GL.drawBuffers(buffersToDraw);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        //TODO use Renderer.resize()?
        GL.viewport(0, 0, this.width, this.height);
        let perspective = mat4.create();
        mat4.perspective(perspective, Renderer.camera.getFOV(), this.width/this.height, Renderer.NEAR_DEPTH, Renderer.FAR_DEPTH);
        Renderer._updatePerspective(perspective);
    }

    unbind() {
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
        GL.viewport(0, 0, Renderer.getWindowWidth(), Renderer.getWindowHeight());
        let perspective = mat4.create();
        mat4.perspective(perspective, Renderer.camera.getFOV(),Renderer.getWindowWidth()/Renderer.getWindowHeight(), Renderer.NEAR_DEPTH, Renderer.FAR_DEPTH);
        Renderer._updatePerspective(perspective);
    }

    bindTexture(slot, index) {
        GL.activeTexture(GL.TEXTURE0 + slot);
        let tex = this.colorTex[index];
        GL.bindTexture(GL.TEXTURE_2D, tex);
    }

    bindDepthTexture(slot) {
        if (!this.accessibleDepth) { Debug.error("inaccessible Depth Tex"); return;}
        GL.activeTexture(GL.TEXTURE0 + slot);
        let tex = this.depthTex;
        GL.bindTexture(GL.TEXTURE_2D, tex);
    }

    bindCubeMapTexture(slot) {
        if (!this.cubeTex) {Debug.error("FBO is not part of a cubemap"); return;}
        GL.activeTexture(GL.TEXTURE0 + slot);
        GL.bindTexture(GL.TEXTURE_CUBE_MAP, this.cubeTex);
    }

    blitAll() {
        for (let index = 0; index < this.numColorTex; ++index) {
            this.blitFramebuffer(index, index * 300, 0, 300, 300);
        }
    }

    blitFramebuffer(index, x, y, dest_width, dest_height) {
        //Requires WebGL 2.0
        GL.bindFramebuffer(GL.READ_FRAMEBUFFER, this.id);
        GL.readBuffer(GL.COLOR_ATTACHMENT0 + index);
        GL.blitFramebuffer(0, 0, this.width, this.height, x, y, x+dest_width, y+dest_height, GL.COLOR_BUFFER_BIT, GL.LINEAR);
        GL.bindFramebuffer(GL.READ_FRAMEBUFFER, null);

    }

    draw() {
        if (!Framebuffer.prototype.loaded) {
            Framebuffer.load();
        }

        if (Renderer.gpuData.vaoHandle !== Framebuffer.prototype.meshData.vaoHandle) {
            GL.bindVertexArray(Framebuffer.prototype.meshData.vaoHandle);
            Renderer.gpuData.vaoHandle = Framebuffer.prototype.meshData.vaoHandle;
        }

        GL.drawElements(GL.TRIANGLES, Framebuffer.prototype.meshData.indexSize, GL.UNSIGNED_SHORT, 0);
    }

    _addColorTexture(index) {
        this.colorTex[index] = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_2D, this.colorTex[index]);

        if (!GLExtensions.colorBuffer) {
            this.hdrEnabled = false;
        }


        let type = -1;
        let isHDR = false;
        switch (this.colorFormats[index]) {
          case GL.RGBA8:
          case GL.RGBA:
              type = GL.UNSIGNED_BYTE;
              break;
          case GL.RGBA16F:
              type = GL.HALF_FLOAT;
              isHDR = true;
              break;
        }
        let filter = (!isHDR || GLExtensions.texture_float_linear) ? GL.LINEAR : GL.NEAREST;
        if (filter === GL.NEAREST) console.error("WARNING!!! NEAREST TEXTURE FILTER ON FRAMEBUFFER!");
        GL.texImage2D(GL.TEXTURE_2D, 0, this.colorFormats[index], this.width, this.height, 0, GL.RGBA, type, null);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, filter);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, filter);

        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);

        //TODO make sure the addition works ok with the extension
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0 + index, GL.TEXTURE_2D, this.colorTex[index], 0 );


        GL.bindTexture(GL.TEXTURE_2D, null);
    }

    _addDepthTexture() {
        this.depthTex = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_2D, this.depthTex);

        GL.texImage2D(GL.TEXTURE_2D, 0, GL.DEPTH_COMPONENT16, this.width, this.height, 0, GL.DEPTH_COMPONENT, GL.UNSIGNED_SHORT, null);

        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);

        //CLAMP_TO_BORDER would have been better... but that is not supported.
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);

        /* WebGL lacks these... sad day :(
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_COMPARE_MODE, GL_COMPARE_R_TO_TEXTURE);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_COMPARE_FUNC, GL_LEQUAL);
        */

        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.TEXTURE_2D, this.depthTex, 0);
    }

    _addDepthBuffer() {
        this.depthTex = GL.createRenderbuffer();
        GL.bindRenderbuffer(GL.RENDERBUFFER, this.depthTex);
        GL.renderbufferStorage(GL.RENDERBUFFER, GL.DEPTH_COMPONENT16, this.width, this.height);
        GL.framebufferRenderbuffer(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.RENDERBUFFER, this.depthTex);
    }

    static generateCubeMapArray(width, height, depthOnly) {
      if (!depthOnly) Debug.assert(false); //not yet implemented

      let fboArray = [];


      GL.activeTexture(GL.TEXTURE0);
      let cubeTex = GL.createTexture();
      GL.bindTexture(GL.TEXTURE_CUBE_MAP, cubeTex);
      GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
      GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_MAG_FILTER, GL.NEAREST);

      for (let f1=0; f1<6; ++f1) {
        GL.texImage2D(GL.TEXTURE_CUBE_MAP_POSITIVE_X + f1, 0, GL.DEPTH_COMPONENT16, width, height, 0, GL.DEPTH_COMPONENT, GL.UNSIGNED_SHORT, null);
      }

      for (let f=0; f<6; ++f) {
        fboArray[f] = new Framebuffer(width, height, 0, true, false, null, true);

        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.TEXTURE_CUBE_MAP_POSITIVE_X + f, cubeTex, 0);

        fboArray[f].cubeTex = cubeTex;

        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
      }

      GL.bindTexture(GL.TEXTURE_CUBE_MAP, null);

      return fboArray;

    }


static load() {
    let fbo_vertices = [ -1, -1, 0, 0, 0,
        1, -1, 0, 1, 0,
        1,  1, 0, 1, 1,
        -1,  1, 0, 0, 1 ];

    let INDEX_COUNT = 6;
    let fbo_indices = [ 0, 1, 2, 0, 2, 3 ];

    let FLOAT_SIZE = 4;

    let POSITION_COUNT = 3;
    let TEX_COORD_COUNT = 2;

    let VERTEX_ATTRIB_LOCATION =0;
    let TEX_COORD_0_ATTRIB_LOCATION = 2;

    Framebuffer.prototype.meshData = {};

    let vao = GL.createVertexArray();
    GL.bindVertexArray(vao);

    GL.enableVertexAttribArray(VERTEX_ATTRIB_LOCATION);
    GL.enableVertexAttribArray(TEX_COORD_0_ATTRIB_LOCATION);

    //TODO use new Float32Array etc. for passing in data
    let meshBuffer = GL.createBuffer();
    let indBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, meshBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(fbo_vertices), GL.STATIC_DRAW);

    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, indBuffer);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(fbo_indices), GL.STATIC_DRAW);

    let stride = FLOAT_SIZE * (POSITION_COUNT + TEX_COORD_COUNT);
    GL.vertexAttribPointer(VERTEX_ATTRIB_LOCATION, 3, GL.FLOAT, false, stride, 0);
    GL.vertexAttribPointer(TEX_COORD_0_ATTRIB_LOCATION, 2, GL.FLOAT, false, stride, (FLOAT_SIZE * 3));

    Framebuffer.prototype.meshData.vaoHandle = vao;
    Framebuffer.prototype.meshData.indexSize = INDEX_COUNT;

    Framebuffer.prototype.loaded = true;
}

}