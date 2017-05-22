/**
 * Created by Accipiter Chalybs on 5/9/2017.
 */

class Decal extends Component {
  constructor(scale = 1, color, texture, normal){
    super();
    this.componentType = "Decal";

    this.scale = vec3.fromValues(scale, scale, scale);
    this.color = color;
    this.texture = texture;
    this.normalTexture = normal;
  }

  startClient() {
    if (!Decal.prototype._isLoaded) {
      Decal._load();
    }
  }

  updateComponentClient() {
  }

  draw() {
    if (Renderer.gpuData.vaoHandle !== Decal.prototype._meshData.vaoHandle) {
      GL.bindVertexArray(Decal.prototype._meshData.vaoHandle);
      Renderer.gpuData.vaoHandle = Decal.prototype._meshData.vaoHandle;
    }

    this.texture.bindTexture(3);
    this.normalTexture.bindTexture(4);

    let forward = vec3.create();
    vec3.scale(forward,this.transform.getForward(),-1);
    vec3.normalize(forward, forward);

    let transformMatrix = mat4.create();
    mat4.scale(transformMatrix, this.gameObject.transform.getTransformMatrix(), this.scale);

    Renderer.setModelMatrix(transformMatrix);
    Renderer.currentShader.setUniform('uInvM_Matrix', mat4.invert(transformMatrix, transformMatrix), UniformTypes.mat4);
    Renderer.currentShader.setUniform('uForwardNormal', forward, UniformTypes.vec3);
    Renderer.currentShader.setUniform('decalWorldPosition', this.transform.getWorldPosition(), UniformTypes.vec3);

    Renderer.currentShader.setUniform('uDecalColor', this.color, UniformTypes.vec4);

    GL.drawElements(GL.TRIANGLES, Decal.prototype._meshData.indexSize, GL.UNSIGNED_SHORT, 0);
  }

  static _load() {

    let vertices=[ -0.5, -0.5, Decal.prototype.sizeZ,
       0.5, -0.5, Decal.prototype.sizeZ,
       0.5,  0.5, Decal.prototype.sizeZ,
      -0.5,  0.5, Decal.prototype.sizeZ,

      -0.5, -0.5, -Decal.prototype.sizeZ,
       0.5, -0.5, -Decal.prototype.sizeZ,
       0.5,  0.5, -Decal.prototype.sizeZ,
      -0.5,  0.5, -Decal.prototype.sizeZ ];

    let indices = [ 0, 1, 2, 0, 2, 3,
                    1, 5, 6, 6, 2, 1,
                    7, 6, 5, 5, 4, 7,
                    4, 0, 3, 3, 7, 4,
                    4, 5, 1, 1, 0, 4,
                    3, 2, 6, 6, 7, 3];

    let vao = GL.createVertexArray();
    GL.bindVertexArray(vao);

    GL.enableVertexAttribArray(0);

    let meshBuffer = GL.createBuffer();
    let indexBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, meshBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(vertices), GL.STATIC_DRAW);


    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, indexBuffer);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), GL.STATIC_DRAW);


    let POSITION_COUNT = 3;
    let stride = 4 * (POSITION_COUNT);
    GL.vertexAttribPointer(0, 3, GL.FLOAT, false, stride, 0);

    Decal.prototype._meshData.vaoHandle = vao;
    Decal.prototype._meshData.indexSize = indices.length;
    Decal.prototype._isLoaded = true;
  }
}
Decal.prototype._isLoaded = false;
Decal.prototype._meshData = {};
Decal.prototype.sizeZ = 0.05;