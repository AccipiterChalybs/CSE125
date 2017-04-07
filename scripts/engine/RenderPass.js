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
        this._brightPass = null;
        this._blurBuffers = [];
        this._deferredPass = deferred;
    }
}