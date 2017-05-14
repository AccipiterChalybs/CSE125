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
    bindShadowMap(pass){
    }
}

class PointLight extends Light{

    constructor(shadow) {
      super();
      this.isShadowCaster = shadow;
    }

    startClient() {
      if(this.isShadowCaster)
      {
        this.cubeShadow = true;
        this.fbo = Framebuffer.generateCubeMapArray(64, 64, true);
      }
    }

    forwardPass(index){
        for (let shaderId of Renderer.shaderForwardLightList) {
            let posData = vec4.create(); vec4.set(posData, this.gameObject.transform.getWorldPosition()[0],
                this.gameObject.transform.getWorldPosition()[1], this.gameObject.transform.getWorldPosition()[2], this.radius);
            let colourData = vec4.create(); vec4.set(colourData, this.color[0], this.color[1], this.color[2], 1.0);
            let metaData = vec4.create(); vec4.set(metaData, this.range, 0.0, 0.0, 1); //range, blank, blank, blank

            Renderer.getShader(shaderId).setUniform("uLightData[" + (3*index) + "]", posData, UniformTypes.vec4);
            Renderer.getShader(shaderId).setUniform("uLightData[" + (3*index+1) + "]", colourData, UniformTypes.vec4);
            Renderer.getShader(shaderId).setUniform("uLightData[" + (3*index+2) + "]", metaData, UniformTypes.vec4);
        }
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

  prepShadowMap() {
    Renderer.shaderList[Renderer.POINT_SHADOW_SHADER].setUniform("uP_Matrix", PointLight.prototype.shadowMatrix, UniformTypes.mat4);
    Renderer.shaderList[Renderer.POINT_SHADOW_SHADER_ANIM].setUniform("uP_Matrix", PointLight.prototype.shadowMatrix, UniformTypes.mat4);

    Renderer.shaderList[Renderer.POINT_SHADOW_SHADER].setUniform("uLightPosition",this.gameObject.transform.getWorldPosition(),UniformTypes.vec3);
    Renderer.shaderList[Renderer.POINT_SHADOW_SHADER_ANIM].setUniform("uLightPosition",this.gameObject.transform.getWorldPosition(),UniformTypes.vec3);

    Renderer.shaderList[Renderer.POINT_SHADOW_SHADER].setUniform("uFarDepth", PointLight.prototype.FAR_DEPTH, UniformTypes.u1f);
    Renderer.shaderList[Renderer.POINT_SHADOW_SHADER_ANIM].setUniform("uFarDepth", PointLight.prototype.FAR_DEPTH, UniformTypes.u1f);
  }


  bindShadowMap(pass){
    if(this.fbo && this.fbo !== null && this.isShadowCaster)
    {
      this.fbo[pass].bind([]);

      let mat = mat4.fromTranslation(mat4.create(), vec3.scale(vec3.create(), this.gameObject.transform.getWorldPosition(), -1));
      mat4.multiply(mat, PointLight.prototype.viewMatrixArray[pass], mat);
      Renderer.getShader(Renderer.POINT_SHADOW_SHADER_ANIM).setUniform("uV_Matrix",mat,UniformTypes.mat4);
      Renderer.getShader(Renderer.POINT_SHADOW_SHADER).setUniform("uV_Matrix",mat,UniformTypes.mat4);
    }
  }
}

PointLight.prototype.FAR_DEPTH = 25;
PointLight.prototype.shadowMatrix = mat4.perspective(mat4.create(), Math.PI/2, 1, 0.1, PointLight.prototype.FAR_DEPTH);
PointLight.prototype.viewMatrixArray = [
  mat4.lookAt(mat4.create(), vec3.create(), vec3.fromValues(1,0,0), vec3.fromValues(0,-1,0)),
  mat4.lookAt(mat4.create(), vec3.create(), vec3.fromValues(-1,0,0), vec3.fromValues(0,-1,0)),
  mat4.lookAt(mat4.create(), vec3.create(), vec3.fromValues(0,1,0), vec3.fromValues(0,0,1)),
  mat4.lookAt(mat4.create(), vec3.create(), vec3.fromValues(0,-1,0), vec3.fromValues(0,0,-1)),
  mat4.lookAt(mat4.create(), vec3.create(), vec3.fromValues(0,0,1), vec3.fromValues(0,-1,0)),
  mat4.lookAt(mat4.create(), vec3.create(), vec3.fromValues(0,0,-1), vec3.fromValues(0,-1,0)),
];



class DirectionalLight extends Light{

  constructor(shadow) {
    super();
    this.isShadowCaster = shadow;
  }

  startClient() {
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

        let lightMetaData = vec3.create(); vec3.set(lightMetaData, this.constantFalloff, this.linearFalloff, this.exponentialFalloff);
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

  bindShadowMap(pass){
    if(this.fbo && this.fbo !== null && this.isShadowCaster)
    {
      this.fbo.bind([]);
      Renderer.shaderList[Renderer.SHADOW_SHADER].setUniform("uP_Matrix", DirectionalLight.prototype.shadowMatrix, UniformTypes.mat4);
      Renderer.shaderList[Renderer.SHADOW_SHADER_ANIM].setUniform("uP_Matrix", DirectionalLight.prototype.shadowMatrix, UniformTypes.mat4);

      let mat = mat4.invert(mat4.create(), this.gameObject.transform.getTransformMatrix());
      Renderer.getShader(Renderer.SHADOW_SHADER_ANIM).setUniform("uV_Matrix",mat,UniformTypes.mat4);
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
    forwardPass(index){}
    deferredPass(bind){}
}