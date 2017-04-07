/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */
class RenderPass
{
    render(){}
}

class ForwardPass extends RenderPass
{
    render(){}
}

class ParticlePass extends RenderPass
{
    render(){}
}

class DeferredPass extends RenderPass
{
    constructor(){
        super();
        this.fbo = null;
    }

    render(){}
}

class SkyboxPass extends RenderPass
{
    constructor(skybox){
        super();
        this.skybox = skybox;
    }

    render(){}
}

class ShadowPass extends ForwardPass
{
    render(){}
}

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

            s2["level"] = 0.f;
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