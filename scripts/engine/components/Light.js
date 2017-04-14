/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */

class Light extends Component{
    constructor(){
        super();
        this.componentType = "Light";
        this.color = null;
        this.isShadowCaster = false;
        this.radius = 0.02;
        this.shadowMatrix = null;
    }
    forwardPass(index){}
    deferredPass(bind){}
    deferredHelper(meshName, bind){}
    bindShadowMap(){}
}

class PointLight extends Light{
    forwardPass(index){}
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