/**
 * Created by Accipiter Chalybs on 6/3/2017.
 */
class ClothMesh extends Mesh {

  constructor({material= "ivy_leaves_c",
                sizeX= 1,
                sizeY= 1,
                sizeZ= 0.2}) {
    super();
    this.componentType = "Mesh";

    this.name = "Cloth0" + (ClothMesh.prototype.currentNum++);

    this.startTime = 0;
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.sizeZ = sizeZ;
    this.width = 20;
    this.height = 10;

    this.makeCloth();

    //this.name = "Sphere_Icosphere";
    /*
    this.name = name;
    if (!Mesh.prototype.meshMap.hasOwnProperty(name)) this.name = name;//throw new Error('No mesh of name\"'+name+'\" found.');
    */
  }


  updateComponentClient() {
    this.clothPhysics(this.outPos, this.outPos);
    this.uploadVertexData();
  }

  clothPhysics(inputPositions, outputPositions) {
    this.startTime += Time.deltaTime;
    for (let i=0; i<inputPositions.length; ++i) {
      let position = vec3.fromValues(inputPositions[3 * i],
                                     inputPositions[3 * i + 1],
                                     inputPositions[3 * i + 2]);

      let pinning = (-position[1]) / (this.sizeY*((this.height-1)/this.height));
      position[2] = (pinning) * this.sizeZ*Math.cos(5*position[0]/this.sizeX + Time.time);

      for (let p = 0; p < 3; ++p) {
        outputPositions[i*3 +p] = position[p];
      }
    }
  }


  makeCloth() {
    this.vertPos = [];
    this.adj = [];

    let staticData = [];
    let indices = [];

    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {
        this.vertPos.push(this.sizeX*x/this.width - this.sizeX/2.0, this.sizeY*y/this.height - this.sizeY*(this.height-1)/this.height, 0);

        let ptX = (x + 1) + y * this.width;
        let ptY = x + (y + 1) * this.width;
        let multiplierX = 1;
        let multiplierY = 1;

        if (x === this.width-1) {
          multiplierX = -1;
          ptX = (x - 1) + y * this.width;
        }
        if (y === this.height-1) {
          multiplierY = -1;
          ptY = x + (y - 1) * this.width;
        }

        this.adj[x + y * this.width] = [ptX, ptY, multiplierX, multiplierY];

        staticData.push(x / (this.width-1), (y / (this.height-1)) ); //texture coordinates
      }
    }

    for (let y = 0; y < this.height - 1; ++y) {
      for (let x = 0; x < this.width - 1; ++x) {
        let ptIndex0 = x + (y * this.width);
        let ptIndex1 = (x + 1) + (y * this.width);
        let ptIndex2 = x + ((y + 1) * this.width);
        indices.push(ptIndex0, ptIndex1, ptIndex2);

        let ptIndex3 = (x + 1) + ((y + 1) * this.width);
        let ptIndex4 = x + ((y + 1) * this.width);
        let ptIndex5 = (x + 1) + (y * this.width);
        indices.push(ptIndex3, ptIndex4, ptIndex5);
      }
    }

    this.outPos = new Float32Array(this.vertPos);

    this.clothArray = new Float32Array((4 * 3) * this.width * this.height);
    this.initializeCloth(staticData, indices);
    this.uploadVertexData();
  }

  initializeCloth(staticData, indices) {

    ///-----------OpenGL stuff--------------

    this.vao = GL.createVertexArray();
    GL.bindVertexArray(this.vao);

    GL.enableVertexAttribArray(Mesh.prototype.VERTEX_ATTRIB_LOCATION);
    GL.enableVertexAttribArray(Mesh.prototype.NORMAL_ATTRIB_LOCATION);
    GL.enableVertexAttribArray(Mesh.prototype.TEX_COORD_0_ATTRIB_LOCATION);
    GL.enableVertexAttribArray(Mesh.prototype.TANGENT_ATTRIB_LOCATION);
    GL.enableVertexAttribArray(Mesh.prototype.BITANGENT_ATTRIB_LOCATION);


    this.meshBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, this.meshBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, this.clothArray, GL.STREAM_DRAW);

    //Setup vertexAttribPointers into meshBuffer
    let stride1 = Mesh.prototype.FLOAT_SIZE * (Mesh.prototype.POSITION_COUNT + Mesh.prototype.NORMAL_COUNT);
    stride1 += Mesh.prototype.FLOAT_SIZE * (2 * Mesh.prototype.TANGENT_COUNT); //Tangents and Bitangents

    let currentOffset = 0;
    GL.vertexAttribPointer(0, 3, GL.FLOAT, false, stride1, currentOffset);
    currentOffset += (Mesh.prototype.FLOAT_SIZE * 3);
    GL.vertexAttribPointer(1, 3, GL.FLOAT, false, stride1, currentOffset);
    currentOffset += (Mesh.prototype.FLOAT_SIZE * 3);
    GL.vertexAttribPointer(3, 3, GL.FLOAT, false, stride1, currentOffset);
    currentOffset += (Mesh.prototype.FLOAT_SIZE * 3);
    GL.vertexAttribPointer(4, 3, GL.FLOAT, false, stride1, currentOffset);



    let staticBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, staticBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(staticData), GL.STREAM_DRAW);


    let stride2 = 0;
    stride2 += Mesh.prototype.FLOAT_SIZE * Mesh.prototype.TEX_COORD_COUNT;
    //if (hasBones) stride2 += Mesh.prototype.FLOAT_SIZE * Mesh.prototype.BONE_WEIGHT_COUNT;

    currentOffset = 0;
    GL.vertexAttribPointer(2, 2, GL.FLOAT, false, stride2, currentOffset);
    currentOffset += (Mesh.prototype.FLOAT_SIZE * 2);

   /* if (hasBones) {
      GL.vertexAttribPointer(5, 4, GL.FLOAT, false, stride2, currentOffset);
      currentOffset += (Mesh.prototype.FLOAT_SIZE * 4);

      let boneBuffer = GL.createBuffer();
      GL.bindBuffer(GL.ARRAY_BUFFER, boneBuffer);
      GL.bufferData(GL.ARRAY_BUFFER, new Uint8Array(idArray), GL.STATIC_DRAW);
      GL.vertexAttribIPointer(6, 4, GL.UNSIGNED_BYTE, Mesh.prototype.BYTE_SIZE * 4, 0); //WebGL 2.0 yay!
    }
    */

    let indexBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, indexBuffer);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), GL.STATIC_DRAW);

    let meshData = {};
    meshData.vaoHandle = this.vao;
    meshData.indexSize = indices.length;
    meshData.sphere = {center: vec3.create(), radius: this.sizeX};

    Mesh.prototype.meshMap[this.name] = meshData;
  }

  uploadVertexData() {
    let arrayIndex = 0;

    let tangent = vec3.create();
    let bitangent = vec3.create();
    let n = vec3.create();
    let t = vec3.create();
    let b = vec3.create();
    for (let i=0; i<this.outPos.length/3; ++i) {
      for (let p = 0; p < Mesh.prototype.POSITION_COUNT; ++p) {
        this.clothArray[arrayIndex++] = (this.outPos[i*3 + p]);
      }

      let ptArray = [];
      let pointIndices = [i, this.adj[i][0], this.adj[i][1]];
      for (let index=0; index<3; ++index) {
        ptArray[index] = vec3.fromValues(this.outPos[3 * pointIndices[index]],
                                         this.outPos[3 * pointIndices[index] + 1],
                                         this.outPos[3 * pointIndices[index] + 2]);
      }

      vec3.sub(tangent, ptArray[1], ptArray[0]); vec3.scale(tangent, tangent, this.adj[i][2]);
      vec3.sub(bitangent, ptArray[2], ptArray[0]); vec3.scale(bitangent, bitangent, this.adj[i][3]);
      vec3.cross(n, tangent, bitangent);

      vec3.cross(t, bitangent, n);
      vec3.cross(b, n, t);

      this.clothArray[arrayIndex++] = n[0];
      this.clothArray[arrayIndex++] = n[1];
      this.clothArray[arrayIndex++] = n[2];

      this.clothArray[arrayIndex++] = t[0];
      this.clothArray[arrayIndex++] = t[1];
      this.clothArray[arrayIndex++] = t[2];

      this.clothArray[arrayIndex++] = b[0];
      this.clothArray[arrayIndex++] = b[1];
      this.clothArray[arrayIndex++] = b[2];
    }


    GL.bindVertexArray(this.vao);
    GL.bindBuffer(GL.ARRAY_BUFFER, this.meshBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, this.clothArray, GL.STREAM_DRAW);
  }

  draw() {
    GL.disable(GL.CULL_FACE);
    super.draw();
    GL.enable(GL.CULL_FACE);
  }
}
ClothMesh.prototype.currentNum = 0;