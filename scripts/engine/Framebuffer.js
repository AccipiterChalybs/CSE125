/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */

//TODO convert ot webgl 2.0

class Framebuffer {

    constructor(w, h, numColorTexture, accessibleDepth, hdrEnabled) {
        //this.id = 0;
        this.accessibleDepth = accessibleDepth;
        //this.colorTex = [];
        this.numColorTex = numColorTexture;
        this.depthTex = 0;

        this.hdrEnabled = hdrEnabled;
        this.colorFormats = [];
        this.width = w;
        this.height = h;

        //static meshdata
        //static bool loaded

        this.id = GL.createFramebuffer();
        GL.bindFramebuffer(GL.FRAMEBUFFER, this.id);

        this.colorTex = [];
        for (let x=0; x<this.numColorTex; ++x) {
            this.colorFormats[x] = GL.RGBA;
            this._addColorTexture(x);
        }

        if (this.accessibleDepth) {
            this._addDepthTexture();
        } else {
            this._addDepthBuffer();
        }

        GL.bindFramebuffer(GL.FRAMEBUFFER, 0);
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
        GL.bindFramebuffer(GL.FRAMEBUFFER, 0);
    }

    //note buffersToDraw should be an array of COLOR_ATTACHMENTX_WEBGL
    bind(buffersToDraw) {
        GL.bindFramebuffer(GL.FRAMEBUFFER, this.id);
        //GLExtension Hope that you can draw multiple render targets...
        if (GLExtensions.draw_buffers) {
            //TODO can use gl.drawBuffers in webgl2
            GLExtensions.draw_buffers.drawBuffersWEBGL(buffersToDraw);
        }
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        //TODO use Renderer.resize()?
        GL.viewport(0, 0, this.width, this.height);
        let perspective = mat4.create();
        mat4.perspective(perspective, Renderer.camera.getFOV(), this.width/this.height, NEAR_DEPTH, FAR_DEPTH);
        Renderer.updatePerspective(perspective);
    }

    unbind() {
        GL.bindFramebuffer(GL.FRAMEBUFFER, 0);
        GL.viewport(0, 0, Renderer.getWindowWidth(), Renderer.getWindowHeight());
        let perspective = mat4.create();
        mat4.perspective(perspective, Renderer.camera.getFOV(),Renderer.getWindowWidth()/Renderer.getWindowHeight(), NEAR_DEPTH, FAR_DEPTH);
        Renderer.updatePerspective(perspective);
    }

    bindTexture(slot, index) {
        GL.activeTexture(GL.TEXTURE0 + slot);
        let tex = this.colorTex[index];
        GL.bindTexture(GL.TEXTURE_2D, tex);
    }

    bindDepthTexture(slot) {
        if (!this.accessibleDepth) { console.error("inaccessible Depth Tex"); return;}
        GL.activeTexture(GL.TEXTURE0 + slot);
        let tex = this.depthTex;
        GL.bindTexture(GL.TEXTURE_2D, tex);
    }

    blitAll() {
        for (let index = 0; index < this.numColorTex; ++index) {
            this.blitFramebuffer(index, index * 300, 0, 300, 300);
        }
    }

    blitFramebuffer(index, x, y, dest_width, dest_height) {
        //TODO (webgl 2)
        /*
        GL.bindFramebuffer(GL.READ_FRAMEBUFFER, this.id);
        GL.readBuffer(GL.COLOR_ATTACHMENT0 + index);
        GL.blitFramebuffer(0, 0, this.width, this.height, x, y, x+dest_width, y+dest_height, GL.COLOR_BUFFER_BIT, GL.LINEAR);
        GL.bindFramebuffer(GL.READ_FRAMEBUFFER, 0);
        */
    }

    draw() {
        //TODO static variable I think?
        if (!Framebuffer.loaded) {
            Framebuffer.load();
        }

        if (Renderer.gpuData.vaoHandle !== Framebuffer.meshData.vaoHandle) {
            //TODO change this since I don't think VAO are avaialable
            GL.bindBuffer(Framebuffer.meshData.vaoHandle);
            Renderer.gpuData.vaoHandle = Framebuffer.meshData.vaoHandle;
        }

        GL.drawElements(GL.TRIANGLES, Framebuffer.meshData.indexSize, GL.UNSIGNED_INT, 0);
    }

    _addColorTexture(index) {
        this.colorTex[index] = GL.createTexture();
        GL.bindTexture(1, this.colorTex[index]);

        let type = (this.hdrEnabled && GLExtensions.texture_float && GLExtensions.texture_float_linear) ? GL.FLOAT : GL.UNSIGNED_BYTE
        GL.texImage2D(GL.TEXTURE_2D, 0, this.colorFormats[index], this.width, this.height, 0, GL.RGBA, type, 0);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);

        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);

        //TODO make sure the addition works ok with the extension
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GLExtensions.draw_buffers.COLOR_ATTACHMENT0_WEBGL + index, GL.TEXTURE_2D, this.colorTex[index], 0 );
    }

    _addDepthTexture() {
        this.depthTex = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_2D, this.depthTex);

        GL.texImage2D(Gl.TEXTURE_2D, 0, GL.DEPTH_COMPONENT16, this.width, this.height, 0, GL.DEPTH_COMPONENT, GL.UNSIGNED_SHORT, 0);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);

        //CLAMP_TO_BORDER would have been better... but that is not supported.
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);

        /* WebGL lacks these... sad day :(
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_COMPARE_MODE, GL_COMPARE_R_TO_TEXTURE);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_COMPARE_FUNC, GL_LEQUAL);
        */

        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, this.depthTex, 0);
    }

    _addDepthBuffer() {
        this.depthTex = GL.createRenderbuffer();
        GL.bindRenderbuffer(GL.RENDERBUFFER, this.depthTex);
        GL.renderbufferStorage(GL.RENDERBUFFER, GL.DEPTH_COMPONENT, this.width, this.height);
        GL.framebufferRenderbuffer(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.RENDERBUFFER, this.depthTex);
    }


static load() {
    let VERTEX_COUNT = ((3+2) * 4);
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

    Framebuffer.meshData = {};

    //TODO check sizes
    intSize = 4;

    //let vao = GL.createBuffer();
    //glBindVertexArray(vao);

    //glEnableVertexAttribArray(VERTEX_ATTRIB_LOCATION);
    //glEnableVertexAttribArray(TEX_COORD_0_ATTRIB_LOCATION);

    //TODO use new Float32Array etc. for passing in data
    let meshBuffer = GL.createBuffer();
    let indBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, meshBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, VERTEX_COUNT * FLOAT_SIZE, fbo_vertices, GL.STATIC_DRAW);


    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, indBuffer);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, INDEX_COUNT * 4, fbo_indices, GL_STATIC_DRAW);


    let stride = FLOAT_SIZE * (POSITION_COUNT + TEX_COORD_COUNT);
    GL.vertexAttribPointer(VERTEX_ATTRIB_LOCATION, 3, GL.FLOAT, false, stride, 0);
    GL.vertexAttribPointer(TEX_COORD_0_ATTRIB_LOCATION, 2, GL.FLOAT, false, stride, (FLOAT_SIZE * 3));

    Framebuffer.meshData.vaoHandle = vao;
    Framebuffer.meshData.indexSize = INDEX_COUNT;

    Framebuffer.loaded = true;
}

}