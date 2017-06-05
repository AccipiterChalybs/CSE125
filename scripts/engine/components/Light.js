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
        this.range = 10;
        this.serializeDirty=true;
    }

    start(){
      this.gameObject.addComponentToSerializeableList(this);
    }

    startClient(){
      this.gameObject.addComponentToSerializeableList(this);
    }

    forwardPass(index){}
    deferredPass(bind){}

    deferredHelper(meshName, bind){
        let currentEntry = Mesh.prototype.meshMap[meshName];

        //TODO should this be out here? It wasn't originally
        if (Renderer.gpuData.vaoHandle !== currentEntry.vaoHandle) {
          GL.bindVertexArray(currentEntry.vaoHandle);
          Renderer.gpuData.vaoHandle = currentEntry.vaoHandle;
        }
        GL.drawElements(GL.TRIANGLES, currentEntry.indexSize, GL.UNSIGNED_SHORT, 0);

    }
    bindShadowMap(pass, bake){
    }

    setColor(color){
      this.color = color;
      this.serializeDirty=true;
    }

    setRange(range){
      this.range = range;
      this.serializeDirty=true;
    }

    serialize() {
      if(this.serializeDirty){
        let retVal = {};
        retVal.c = [this.color[0],this.color[1],this.color[2]];
        retVal.r = this.range;
        this.serializeDirty = false; // Dont know if need
        return retVal;
      }
      return null;
    }

    applySerializedData(data) {
      this.color[0] = data.c[0];
      this.color[1] = data.c[1];
      this.color[2] = data.c[2];
      this.range = data.r;
    }

}

class PointLight extends Light{
    constructor(shadow, isStatic = false) {
      super();
      this.isShadowCaster = shadow;
      this.isStatic = isStatic;
    }

    startClient() {
      super.startClient();
      if(this.isShadowCaster)
      {
        this.cubeShadow = true;
        if (this.isStatic) {
          this.staticFBO = Framebuffer.generateCubeMapArray(PointLight.shadowSize, PointLight.shadowSize, true);
        }
        this.fbo = Framebuffer.generateCubeMapArray(PointLight.shadowSize, PointLight.shadowSize, true);
      }
    }

    forwardPass(index){
        for (let shaderId of Renderer.shaderForwardLightList) {
            let posData = vec4.create(); vec4.set(posData, this.gameObject.transform.getWorldPosition()[0],
                this.gameObject.transform.getWorldPosition()[1], this.gameObject.transform.getWorldPosition()[2], this.radius);
            let colourData = vec4.create(); vec4.set(colourData, this.color[0], this.color[1], this.color[2], 1.0);
            let metaData = vec4.create(); vec4.set(metaData, this.range, this.isShadowCaster ? 1.0 : 0.0,
                                                             PointLight.prototype.FAR_DEPTH, 1); //range, shadows, far_depth, blank

            Renderer.getShader(shaderId).setUniform("uLightData[" + (3*index) + "]", posData, UniformTypes.vec4);
            Renderer.getShader(shaderId).setUniform("uLightData[" + (3*index+1) + "]", colourData, UniformTypes.vec4);
            Renderer.getShader(shaderId).setUniform("uLightData[" + (3*index+2) + "]", metaData, UniformTypes.vec4);

        }
        //TODO enable:
        //if (this.isShadowCaster) this.bindCubeMap(index+6);
    }
    deferredPass(bind){
        if (bind && this.isShadowCaster) {
            Renderer.currentShader.setUniform("uFarDepth", PointLight.prototype.FAR_DEPTH, UniformTypes.u1f);
        }


        if (bind) {
          Renderer.currentShader.setUniform("uLightRange",this.range,UniformTypes.u1f);
          Renderer.currentShader.setUniform("uLightColor",this.color,UniformTypes.vec3);
          Renderer.currentShader.setUniform("uLightSize",this.radius,UniformTypes.u1f);
          Renderer.currentShader.setUniform("uLightDirection",this.gameObject.transform.getForward(),UniformTypes.vec3);
        }

        Renderer.currentShader.setUniform("uLightPosition",this.gameObject.transform.getWorldPosition(),UniformTypes.vec3);
        Renderer.currentShader.setUniform("uScale",this.range,UniformTypes.u1f);
        this.deferredHelper("Sphere_Icosphere", bind);
    }

  prepShadowMap(bake) {
    if (!bake && this.isStatic) {
      this.copyShadowMap();
    }

    Renderer.shaderList[Renderer.POINT_SHADOW_SHADER_ANIM].setUniform("uP_Matrix", PointLight.prototype.shadowMatrix, UniformTypes.mat4);
    Renderer.shaderList[Renderer.POINT_SHADOW_SHADER_ANIM].setUniform("uLightPosition",this.gameObject.transform.getWorldPosition(),UniformTypes.vec3);
    Renderer.shaderList[Renderer.POINT_SHADOW_SHADER_ANIM].setUniform("uFarDepth", PointLight.prototype.FAR_DEPTH, UniformTypes.u1f);

    Renderer.shaderList[Renderer.POINT_SHADOW_SHADER].setUniform("uP_Matrix", PointLight.prototype.shadowMatrix, UniformTypes.mat4);
    Renderer.shaderList[Renderer.POINT_SHADOW_SHADER].setUniform("uLightPosition",this.gameObject.transform.getWorldPosition(),UniformTypes.vec3);
    Renderer.shaderList[Renderer.POINT_SHADOW_SHADER].setUniform("uFarDepth", PointLight.prototype.FAR_DEPTH, UniformTypes.u1f);

    Renderer.shaderList[Renderer.FORWARD_POINT_SHADOW_SHADER].setUniform("uP_Matrix", PointLight.prototype.shadowMatrix, UniformTypes.mat4);
    Renderer.shaderList[Renderer.FORWARD_POINT_SHADOW_SHADER].setUniform("uLightPosition",this.gameObject.transform.getWorldPosition(),UniformTypes.vec3);
    Renderer.shaderList[Renderer.FORWARD_POINT_SHADOW_SHADER].setUniform("uFarDepth", PointLight.prototype.FAR_DEPTH, UniformTypes.u1f);
  }

  copyShadowMap() {
    if (Renderer.getCurrentShader() !== Renderer.getShader(Renderer.FBO_COPY_DEPTH)) {
      Renderer.switchShader(Renderer.FBO_COPY_DEPTH);
    }
    this.staticFBO[0].bindCubeMapTexture(4);
    for (let f=0; f<6; ++f) {
      Renderer.currentShader.setUniform("currentFace", f, UniformTypes.u1i);
      this.fbo[f].bind([], false, true);
      this.fbo[f].draw();
    }
  }


  bindShadowMap(pass, bake){
    if (bake && !this.isStatic) return;
    let target = (bake) ? this.staticFBO : this.fbo;
    if(target && target !== null && this.isShadowCaster)
    {
      target[pass].bind([], false, !this.isStatic);

      let mat = mat4.fromTranslation(mat4.create(), vec3.scale(vec3.create(), this.gameObject.transform.getWorldPosition(), -1));
      mat4.multiply(mat, PointLight.prototype.viewMatrixArray[pass], mat);
      Renderer.getShader(Renderer.POINT_SHADOW_SHADER_ANIM).setUniform("uV_Matrix",mat,UniformTypes.mat4);
      Renderer.getShader(Renderer.POINT_SHADOW_SHADER).setUniform("uV_Matrix",mat,UniformTypes.mat4);
      Renderer.getShader(Renderer.FORWARD_POINT_SHADOW_SHADER).setUniform("uV_Matrix",mat,UniformTypes.mat4);
    }
  }

  bindCubeMap(slot) {
    if (false || !this.isStatic) {
      //TODO This is causing the crashing somehow - why does staticFBO work fine?
      this.fbo[0].bindCubeMapTexture(slot);
    } else {
      this.staticFBO[0].bindCubeMapTexture(slot);
    }
  }

  getShadowMode() {
    return (this.isStatic) ? ShadowPass.prototype.MODE_DYNAMIC : ShadowPass.prototype.MODE_STATIC /*TODO CHANGE*/;
  }
}

//TODO change per light
PointLight.prototype.FAR_DEPTH = 10;
PointLight.prototype.shadowMatrix = mat4.perspective(mat4.create(), Math.PI/2, 1, 0.1, PointLight.prototype.FAR_DEPTH);
PointLight.prototype.viewMatrixArray = [
  mat4.lookAt(mat4.create(), vec3.create(), vec3.fromValues(1,0,0), vec3.fromValues(0,-1,0)),
  mat4.lookAt(mat4.create(), vec3.create(), vec3.fromValues(-1,0,0), vec3.fromValues(0,-1,0)),
  mat4.lookAt(mat4.create(), vec3.create(), vec3.fromValues(0,1,0), vec3.fromValues(0,0,1)),
  mat4.lookAt(mat4.create(), vec3.create(), vec3.fromValues(0,-1,0), vec3.fromValues(0,0,-1)),
  mat4.lookAt(mat4.create(), vec3.create(), vec3.fromValues(0,0,1), vec3.fromValues(0,-1,0)),
  mat4.lookAt(mat4.create(), vec3.create(), vec3.fromValues(0,0,-1), vec3.fromValues(0,-1,0)),
];
PointLight.shadowSize = 256;



class DirectionalLight extends Light{

  constructor(shadow = false) {
    super();
    this.isShadowCaster = shadow;
  }

  startClient() {
    super.startClient();
    if(this.isShadowCaster)
    {
      this.cubeShadow = false;
      this.fbo = new Framebuffer(2048, 2048, 0, true, false);
    }
  }


  forwardPass(index){
        for (let shaderId of Renderer.shaderForwardLightList) {
            let posData = vec4.create(); vec4.set(posData, this.gameObject.transform.getForward()[0],
                this.gameObject.transform.getForward()[1], this.gameObject.transform.getForward()[2], this.radius);
            let colourData = vec4.create(); vec4.set(colourData, this.color[0], this.color[1], this.color[2], 0.0);
            let metaData = vec4.create(); vec4.set(metaData, 0, 0,0, 1);

            Renderer.getShader(shaderId).setUniform("uLightData[" + (3*index) + "]", posData, UniformTypes.vec4);
            Renderer.getShader(shaderId).setUniform("uLightData[" + (3*index+1) + "]", colourData, UniformTypes.vec4);
            Renderer.getShader(shaderId).setUniform("uLightData[" + (3*index+2) + "]", metaData, UniformTypes.vec4);


            let shadowMat = mat4.create();
            mat4.invert(shadowMat, this.transform.getTransformMatrix());
            mat4.multiply(shadowMat, DirectionalLight.prototype.shadowMatrix, shadowMat);
            mat4.multiply(shadowMat, DeferredPass.prototype.bias, shadowMat);

            Renderer.getShader(shaderId).setUniform('uShadow_Matrix', shadowMat, UniformTypes.mat4);

            this.fbo.bindDepthTexture(3);
        }
    }
    deferredPass(bind){
        GL.disable(GL.STENCIL_TEST);
        GL.disable(GL.DEPTH_TEST);
        GL.disable(GL.CULL_FACE);

        Renderer.currentShader.setUniform("uLightColor",this.color,UniformTypes.vec3);
        Renderer.currentShader.setUniform("uLightDirection",this.gameObject.transform.getForward(),UniformTypes.vec3);

        Renderer.currentShader.setUniform("uScale",1.0,UniformTypes.u1f);
        Renderer.currentShader.setUniform("uLightPosition",vec3.create(),UniformTypes.vec3);
        Renderer.currentShader.setUniform("uV_Matrix",mat4.create(),UniformTypes.mat4);
        Renderer.currentShader.setUniform("uP_Matrix",mat4.create(),UniformTypes.mat4);
        this.deferredHelper("Plane", false);
        Renderer.currentShader.setUniform("uV_Matrix",Renderer.camera.getCameraMatrix(),UniformTypes.mat4);
        Renderer.currentShader.setUniform("uP_Matrix",Renderer.perspective,UniformTypes.mat4);
    }

    updateComponentClient(){
    }

  bindShadowMap(pass, bake){
    if(this.fbo && this.fbo !== null && this.isShadowCaster)
    {
      this.fbo.bind([], false);

      let mat = mat4.invert(mat4.create(), this.gameObject.transform.getTransformMatrix());

      Renderer.shaderList[Renderer.SHADOW_SHADER_ANIM].setUniform("uP_Matrix", DirectionalLight.prototype.shadowMatrix, UniformTypes.mat4);
      Renderer.getShader(Renderer.SHADOW_SHADER_ANIM).setUniform("uV_Matrix",mat,UniformTypes.mat4);

      Renderer.shaderList[Renderer.SHADOW_SHADER].setUniform("uP_Matrix", DirectionalLight.prototype.shadowMatrix, UniformTypes.mat4);
      Renderer.getShader(Renderer.SHADOW_SHADER).setUniform("uV_Matrix",mat,UniformTypes.mat4);

    }
  }
}
DirectionalLight.prototype.shadowMatrix = mat4.ortho(mat4.create(), -25, 25, -25, 25, -25, 25);

class SpotLight extends Light{
    constructor(){
        super();
        this.angle = 30;
        this.exponent = 5;
    }

    startClient(){
      super.startClient();
    }

    forwardPass(index){}
    deferredPass(bind){}
}