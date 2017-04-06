/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */
class Framebuffer {
    constructor(w, h, numColorTexture, colorFormat, accessibleDepth, hdrEnabled) {
        this.id = 0;
        this.accessibleDepth = accessibleDepth;
        this.colorText = 0;
        this.numColorText = numColorTexture;
        this.depthText = 0;

        this.hdrEnabled = hdrEnabled;
        this.colorFormats = colorFormat;
        this.width = w;
        this.height = h;

        //static meshdata
        //static bool loaded
    }

    deleteTextures() {

    }

    resize(w, h) {

    }

    bind(a, b) {

    }

    unbind() {

    }

    bindTexture(slot, index) {

    }

    bindDepthTexture(slot) {

    }

    blitAll() {

    }

    blitFramebuffer(index, x, y, dest_width, dest_height) {

    }

    draw() {

    }
k
}