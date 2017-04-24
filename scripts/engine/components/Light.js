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
    deferredHelper(meshName, bind){}
    bindShadowMap(){}
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
    deferredPass(bind){}
}

class DirectionalLight extends Light{
    forwardPass(index){}
    deferredPass(bind){}
    update(){}
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