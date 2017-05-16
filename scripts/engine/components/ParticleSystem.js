/**
 * Created by Accipiter Chalybs on 5/8/2017.
 */
class ParticleSystem extends Component {

  constructor(additive = false, parameters) {
    super();
    this.componentType = "ParticleSystem";

    this.additive = additive;

    if (parameters === undefined) parameters = {};
    this.texture = (parameters.texture !== undefined) ? parameters.texture : Texture.makeColorTex(vec4.fromValues(1,1,1,1));
    this.numParticles = (parameters.number !== undefined) ? parameters.number : 1000;
    this.duration = (parameters.duration !== undefined) ? parameters.duration : [0.5, 2.5];

    this.velocity = (parameters.velocity !== undefined) ? parameters.velocity : [[-1,0,-1],[1,2,1]];
    this.gravity = (parameters.gravity !== undefined) ? parameters.gravity : -1;
    this.startSize = (parameters.startSize !== undefined) ? parameters.startSize : [0.064, 0.128];
    this.endSize = (parameters.endSize !== undefined) ? parameters.endSize : [0.016, 0.032];
    this.startColor = (parameters.startColor !== undefined) ? parameters.startColor : [[25,0,0,0.5],[25,25,1,0.5]];
    this.endColor = (parameters.endColor !== undefined) ? parameters.endColor : [[0,0,0,0],[0,0,0,0]];


    this._meshData = {};
    this._genParticles();

    this.elapsedTime = 0;
  }

  startClient() {
  }

  updateComponentClient() {
    this.elapsedTime += Time.deltaTime;
  }

  draw() {
    if (this.additive) { //except this if statement :)
      GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);
    } else {
      GL.blendFunc(GL.SRC_ALPHA, GL.ONE);
    }

    if (Renderer.gpuData.vaoHandle !== this._meshData.vaoHandle) {
      GL.bindVertexArray(this._meshData.vaoHandle);
      Renderer.gpuData.vaoHandle = this._meshData.vaoHandle;
    }

    this.texture.bindTexture(0);
    this.setUniforms();

    GL.drawElements(GL.TRIANGLES, this._meshData.indexSize, GL.UNSIGNED_SHORT, 0);
  }

  setUniforms() {
    Renderer.currentShader.setUniform("emitterPos", this.transform.getWorldPosition(), UniformTypes.vec3);

    Renderer.currentShader.setUniform("elapsedTime", this.elapsedTime, UniformTypes.u1f);

    Renderer.currentShader.setUniform("minVelocity", this.velocity[0], UniformTypes.vec3);
    Renderer.currentShader.setUniform("maxVelocity", this.velocity[1], UniformTypes.vec3);
    Renderer.currentShader.setUniform("minAcceleration", vec3.fromValues(0,this.gravity,0), UniformTypes.vec3);
    Renderer.currentShader.setUniform("maxAcceleration", vec3.fromValues(0,this.gravity,0), UniformTypes.vec3);
    Renderer.currentShader.setUniform("minStartColor", this.startColor[0], UniformTypes.vec4);
    Renderer.currentShader.setUniform("maxStartColor", this.startColor[1], UniformTypes.vec4);
    Renderer.currentShader.setUniform("minEndColor", this.endColor[0], UniformTypes.vec4);
    Renderer.currentShader.setUniform("maxEndColor", this.endColor[1], UniformTypes.vec4);
    Renderer.currentShader.setUniform("minStartSize", this.startSize[0], UniformTypes.u1f);
    Renderer.currentShader.setUniform("maxStartSize", this.startSize[1], UniformTypes.u1f);
    Renderer.currentShader.setUniform("minEndSize", this.endSize[0], UniformTypes.u1f);
    Renderer.currentShader.setUniform("maxEndSize", this.endSize[1], UniformTypes.u1f);
  }

  _genParticles() {

    let vertFloatData = [];
    let vertIntData = [];
    let indices = [];


    let vertIndex = 0;
    for (let i=0; i < this.numParticles; ++i) {
      let randSeed = Math.random() * Math.pow(2, 16);
      vertIntData[vertIndex++] = 0; //corner
      vertIntData[vertIndex++] = randSeed; //random seed

      vertIntData[vertIndex++] = 1; //corner
      vertIntData[vertIndex++] = randSeed; //random seed

      vertIntData[vertIndex++] = 2; //corner
      vertIntData[vertIndex++] = randSeed; //random seed

      vertIntData[vertIndex++] = 3; //corner
      vertIntData[vertIndex++] = randSeed; //random seed

      let duration = Math.random() * (this.duration[1] - this.duration[0]) + this.duration[0];
      vertFloatData[i*4] = duration;
      vertFloatData[i*4+1] = duration;
      vertFloatData[i*4+2] = duration;
      vertFloatData[i*4+3] = duration;
      
      // 0, 1, 2, 0, 2, 3
      indices.push(4*i, 4*i+1, 4*i+2, 4*i, 4*i+2, 4*i+3);
    }

    let vao = GL.createVertexArray();
    GL.bindVertexArray(vao);

    GL.enableVertexAttribArray(0);
    GL.enableVertexAttribArray(1);
    GL.enableVertexAttribArray(2);

    let intBuffer = GL.createBuffer();
    let floatBuffer = GL.createBuffer();
    let indexBuffer = GL.createBuffer();

    GL.bindBuffer(GL.ARRAY_BUFFER, intBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, new Uint16Array(vertIntData), GL.STATIC_DRAW);
    GL.vertexAttribIPointer(0, 1, GL.UNSIGNED_SHORT, 4, 0); //corner
    GL.vertexAttribIPointer(1, 1, GL.UNSIGNED_SHORT, 4, 2); //seed

    GL.bindBuffer(GL.ARRAY_BUFFER, floatBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(vertFloatData), GL.STATIC_DRAW);
    GL.vertexAttribPointer(2, 1, GL.FLOAT, false, 4, 0); //duration


    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, indexBuffer);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), GL.STATIC_DRAW);


    this._meshData.vaoHandle = vao;
    this._meshData.indexSize = indices.length;
  }
}