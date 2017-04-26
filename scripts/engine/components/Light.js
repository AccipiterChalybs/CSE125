/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */



class Light extends Component{
    constructor(){
        super();
        this.componentType = "Light";
        this.color = vec3.create(); /*TODO remove */ vec3.set(this.color, 1, 1, 1);
        this.isShadowCaster = false;
        this.radius = 0.25;
        this.shadowMatrix = null;
        this.constantFalloff = 1.0;
        this.linearFalloff = 0.0;
        this.exponentialFalloff = 1.0;
    }
    forwardPass(index){}
    deferredPass(bind){}

    deferredHelper(meshName, bind){
        let currentEntry = Mesh.prototype.meshMap[meshName];

        if (bind) {
            if (Renderer.gpuData.vaoHandle !== currentEntry.vaoHandle) {
                GL.bindVertexArray(currentEntry.vaoHandle);
                Renderer.gpuData.vaoHandle = currentEntry.vaoHandle;
            }

            let lightMetaData = vec3.create(); vec3.set(lightMetaData, constantFalloff, linearFalloff, exponentialFalloff);
            Renderer.currentShader.setUniform("uLightFalloff",lightMetaData,UniformTypes.vec3);
            Renderer.currentShader.setUniform("uLightPosition",gameObject.transform.getWorldPosition(),UniformTypes.vec3);
            Renderer.currentShader.setUniform("uLightColor",this.color,UniformTypes.vec3);
            Renderer.currentShader.setUniform("uLightSize",this.radius,UniformTypes.vec3);
            Renderer.currentShader.setUniform("uLightDirection",gameObject.transform.getForward(),UniformTypes.vec3);
        }
        GL.drawElements(GL.TRIANGLES, currentEntry.indexSize, GL.UNSIGNED_INT, 0);

    }
    bindShadowMap(){
        if(this.fbo && this.fbo !== null && this.shadowCaster)
        {
            this.fbo.bind([GL.NONE]);
            let mat = glm.affineInverse(gameObject.transform.getTransformMatrix());
            Renderer.getShader(Renderer.SHADOW_SHADER_ANIM).setUniform("uV_Matrix",mat,UniformTypes.mat4);
            Renderer.getShader(Renderer.SHADOW_SHADER).setUniform("uV_Matrix",mat,UniformTypes.mat4);
        }
    }
}

class PointLight extends Light{
    forwardPass(index){
        for (let shaderId of Renderer.shaderForwardLightList) {
            let posData = vec4.create(); vec4.set(posData, this.gameObject.transform.getWorldPosition()[0],
                this.gameObject.transform.getWorldPosition()[1], this.gameObject.transform.getWorldPosition()[2], this.radius);
            let colourData = vec4.create(); vec4.set(colourData, this.color[0], this.color[1], this.color[2], 1.0);
            let metaData = vec4.create(); vec4.set(metaData, this.constantFalloff, this.linearFalloff, this.exponentialFalloff, 1);

            Renderer.getShader(shaderId).setUniform("uLightData[" + (3*index) + "]", posData, UniformTypes.vec4);
            Renderer.getShader(shaderId).setUniform("uLightData[" + (3*index+1) + "]", colourData, UniformTypes.vec4);
            Renderer.getShader(shaderId).setUniform("uLightData[" + (3*index+2) + "]", metaData, UniformTypes.vec4);
        }
    }
    deferredPass(bind){
        if (bind) {
            Renderer.currentShader.setUniform("uLightType",0,UniformTypes.);
            let max = std.max(std.max(color.r, color.g), color.b);
            let scale = (-linearFalloff + sqrtf(linearFalloff * linearFalloff - 4.0 * (constantFalloff - 256.0 * max) * exponentialFalloff))
        / (2.0 * exponentialFalloff);
            Renderer.currentShader.setUniform("uScale",scale,UniformTypes.);
        }
        this.deferredHelper("Sphere", bind);
    }
}

class DirectionalLight extends Light{
    forwardPass(index){
        for (let shaderId of Renderer.shaderForwardLightList) {
            let posData = vec4.create(); vec4.set(posData, this.gameObject.transform.getForward()[0],
                this.gameObject.transform.getForward()[1], this.gameObject.transform.getForward()[2], this.radius);
            let colourData = vec4.create(); vec4.set(colourData, this.color[0], this.color[1], this.color[2], 0.0);
            let metaData = vec4.create(); vec4.set(metaData, this.constantFalloff, 0,0, 1);

            Renderer.getShader(shaderId).setUniform("uLightData[" + (3*index) + "]", posData, UniformTypes.vec4);
            Renderer.getShader(shaderId).setUniform("uLightData[" + (3*index+1) + "]", colourData, UniformTypes.vec4);
            Renderer.getShader(shaderId).setUniform("uLightData[" + (3*index+2) + "]", metaData, UniformTypes.vec4);
        }
    }
    deferredPass(bind){
        GL.disable(GL.STENCIL_TEST);
        GL.disable(GL.DEPTH_TEST);
        GL.disable(GL.CULL_FACE);
        Renderer.currentShader.setUniform("uLightType",1,UniformTypes.u1i);
        Renderer.currentShader.setUniform("uScale",1.0,UniformTypes.u1f);
        Renderer.currentShader.setUniform("uLightPosition",vec3.create(),UniformTypes.vec3);
        Renderer.currentShader.setUniform("uV_Matrix",mat4.create(),UniformTypes.mat4);
        Renderer.currentShader.setUniform("uP_Matrix",mat4.create(),UniformTypes.mat4);
        this.deferredHelper("Plane");
        Renderer.currentShader.setUniform("uV_Matrix",Renderer.view,UniformTypes.mat4);
        Renderer.currentShader.setUniform("uP_Matrix",Renderer.perspective,UniformTypes.mat4);
    }
    
    //TODO right method?
    updateClient(){
        gameObject.transform.translate(Renderer.camera.gameObject.transform.getWorldPosition() - gameObject.transform.getWorldPosition());
    }
}

class SpotLight extends Light{
    constructor(){
        super();
        this.angle = 30;
        this.exponent = 5;
    }
    forwardPass(index){}
    deferredPass(bind){}
}