/**
 * Created by Accipiter Chalybs on 4/10/2017.
 */

class Mesh extends Component {

    constructor(name) {
        super();
        this.componentType = "Mesh";
        this.name = name;
        if (!Mesh.prototype.meshMap.hasOwnProperty(name)) this.name = name;//throw new Error('No mesh of name\"'+name+'\" found.');
    }

    draw() {
        let currentEntry = Mesh.prototype.meshMap[this.name];
        if (!currentEntry) {/*console.log(this.name);*/ return; }
        if (Renderer.gpuData.vaoHandle !== currentEntry.vaoHandle) {
            GL.bindVertexArray(currentEntry.vaoHandle);
            Renderer.gpuData.vaoHandle = currentEntry.vaoHandle;
        }

        //TODO move
        Renderer.setModelMatrix(this.gameObject.transform.getTransformMatrix());


        if ((Renderer.currentShader === Renderer.getShader(Renderer.FORWARD_PBR_SHADER_ANIM) ||
            Renderer.currentShader === Renderer.getShader(Renderer.DEFERRED_PBR_SHADER_ANIM) ||
            Renderer.currentShader === Renderer.getShader(Renderer.SHADOW_SHADER_ANIM) ||
            Renderer.currentShader === Renderer.getShader(Renderer.POINT_SHADOW_SHADER_ANIM)) && this.animationRoot) {

            let meshBoneData = Mesh.prototype.boneIdMap[this.name];

            for (let nodeName in this.animationRoot.boneMap) {
                if (!meshBoneData.boneMap.hasOwnProperty(nodeName)) { continue; }
                let id = meshBoneData.boneMap[nodeName];

                let transformMatrix = mat4.create();
                mat4.multiply(transformMatrix, this.animationRoot.boneMap[nodeName].getTransformMatrix(), meshBoneData.boneBindArray[id]);

                Renderer.currentShader.setUniform("bone_Matrix[" + id + "]", transformMatrix, UniformTypes.mat4);
            }
        }

        Debug.Profiler.drawCall();
        GL.drawElements(GL.TRIANGLES, currentEntry.indexSize, GL.UNSIGNED_SHORT, 0);
    }

    setMaterial(mat) {
        this.material = mat;
    }

    static boneWeightSort(bone1, bone2) {
        return bone1.second > bone2.second;
    }

    static loadMesh(name, mesh) {

        let megaArray = [];
        let idArray = [];
        let indexArray = [];

        let enabledTexCoord = [];
        for (let t = 0; t < 8; ++t) {
            enabledTexCoord[t] = t < mesh.numuvcomponents;
        }

        let hasTangents = ("tangents" in mesh);
        let hasBones = ("bones" in mesh);

        let boneResults = null;

        if (hasBones) {
            Mesh.prototype.boneIdMap[name] = {boneMap: {}};
            Mesh.prototype.boneIdMap[name].boneBindArray = [];//(mesh.mNumBones);


            boneResults = [];
            let boneData = [];

            for (let i = 0; i < mesh.vertices.length; ++i) {
                boneData[i]=[];
            }

            for (let b = 0; b < mesh.bones.length; ++b) {
                Mesh.prototype.boneIdMap[name].boneMap[mesh.bones[b].name] = b;
                Mesh.prototype.boneIdMap[name].boneBindArray[b] = mat4.create();
                for (let matIndex = 0; matIndex < 16; ++matIndex) {
                    Mesh.prototype.boneIdMap[name].boneBindArray[b][matIndex] = mesh.bones[b].offsetmatrix[matIndex];
                }
                //Assimp matrices are row major, glm & opengl are column major, so we need to convert here
                mat4.transpose(Mesh.prototype.boneIdMap[name].boneBindArray[b], Mesh.prototype.boneIdMap[name].boneBindArray[b])

                //I think weights is formatted as [vertexId, weight]
                for (let w = 0; w < mesh.bones[b].weights.length; ++w) {
                    boneData[mesh.bones[b].weights[w][0]].push({
                        first: b,
                        second: mesh.bones[b].weights[w][1]
                    });
                }
            }

            for (let i = 0; i < mesh.vertices.length; ++i) {
                boneData[i].sort(Mesh.boneWeightSort);
                let bones = []; //NOTE: this needs to be ints - convert before using in WebGL!
                let weights = vec4.create();
                for (let d = 0; d < 4 && d < boneData[i].length; ++d) {
                    bones[d] = boneData[i][d].first;
                    weights[d] = boneData[i][d].second;
                }
                vec4.scale(weights, weights, 1 / (weights[0] + weights[1] + weights[2] + weights[3]));
                boneResults[i] = {first: bones, second: weights};
            }
        }

        let vertList = [];

        for (let i = 0; i < mesh.vertices.length/3; ++i) {
            for (let p = 0; p < Mesh.prototype.POSITION_COUNT; ++p) {
                megaArray.push(mesh.vertices[i*3 + p]);
            }
            vertList.push(vec3.fromValues(mesh.vertices[i*3],
              mesh.vertices[i*3+1],mesh.vertices[i*3+2]));
            for (let p = 0; p < Mesh.prototype.NORMAL_COUNT; ++p) {
                megaArray.push(mesh.normals[i*3 + p]);
            }
            if (enabledTexCoord[0]) {
                for (let p = 0; p < Mesh.prototype.TEX_COORD_COUNT; ++p) {
                    megaArray.push(mesh.texturecoords[0][i*Mesh.prototype.TEX_COORD_COUNT + p]);
                }
            }
            if (hasTangents) {
                for (let p = 0; p < Mesh.prototype.TANGENT_COUNT; ++p) {
                    megaArray.push(mesh.tangents[i*Mesh.prototype.TANGENT_COUNT + p]);
                }
                for (let p = 0; p < Mesh.prototype.TANGENT_COUNT; ++p) {
                    megaArray.push(mesh.bitangents[i*Mesh.prototype.TANGENT_COUNT + p]);
                }
            }
            if (hasBones) {
                for (let p = 0; p < Mesh.prototype.BONE_WEIGHT_COUNT; ++p) {
                    megaArray.push(boneResults[i].second[p]); //TODO check correctness
                }
                for (let p = 0; p < Mesh.prototype.BONE_ID_COUNT; ++p) {
                    idArray.push(boneResults[i].first[p]); //TODO check correctness
                }
            }
        }


        for (let f = 0; f < mesh.faces.length; ++f) {
            for (let p = 0; p < 3; ++p) {
                indexArray.push(mesh.faces[f][p]);
            }
        }


        let vao = GL.createVertexArray();
        GL.bindVertexArray(vao);

        GL.enableVertexAttribArray(Mesh.prototype.VERTEX_ATTRIB_LOCATION);
        GL.enableVertexAttribArray(Mesh.prototype.NORMAL_ATTRIB_LOCATION);
        if (enabledTexCoord[0]) {
            GL.enableVertexAttribArray(Mesh.prototype.TEX_COORD_0_ATTRIB_LOCATION);
        }
        if (hasTangents) {
            GL.enableVertexAttribArray(Mesh.prototype.TANGENT_ATTRIB_LOCATION);
            GL.enableVertexAttribArray(Mesh.prototype.BITANGENT_ATTRIB_LOCATION);
        }
        if (hasBones) {
            GL.enableVertexAttribArray(Mesh.prototype.BONE_ID_ATTRIB_LOCATION);
            GL.enableVertexAttribArray(Mesh.prototype.BONE_WEIGHT_ATTRIB_LOCATION);
        }

        let meshBuffer = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, meshBuffer);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(megaArray), GL.STATIC_DRAW);


        let indexBuffer = GL.createBuffer();
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, indexBuffer);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexArray), GL.STATIC_DRAW);


        let stride = Mesh.prototype.FLOAT_SIZE * (Mesh.prototype.POSITION_COUNT + Mesh.prototype.NORMAL_COUNT);
        if (hasTangents) stride += Mesh.prototype.FLOAT_SIZE * (2 * Mesh.prototype.TANGENT_COUNT);
        if (enabledTexCoord[0]) stride += Mesh.prototype.FLOAT_SIZE * Mesh.prototype.TEX_COORD_COUNT;
        if (hasBones) stride += Mesh.prototype.FLOAT_SIZE * Mesh.prototype.BONE_WEIGHT_COUNT;

        let currentOffset = 0;

        GL.vertexAttribPointer(0, 3, GL.FLOAT, false, stride, currentOffset);
        currentOffset += (Mesh.prototype.FLOAT_SIZE * 3);
        GL.vertexAttribPointer(1, 3, GL.FLOAT, false, stride, currentOffset);
        currentOffset += (Mesh.prototype.FLOAT_SIZE * 3);
        if (enabledTexCoord[0]) {
            GL.vertexAttribPointer(2, 2, GL.FLOAT, false, stride, currentOffset);
            currentOffset += (Mesh.prototype.FLOAT_SIZE * 2);
        }
        if (hasTangents) {
            GL.vertexAttribPointer(3, 3, GL.FLOAT, false, stride, currentOffset);
            currentOffset += (Mesh.prototype.FLOAT_SIZE * 3);
            GL.vertexAttribPointer(4, 3, GL.FLOAT, false, stride, currentOffset);
            currentOffset += (Mesh.prototype.FLOAT_SIZE * 3);
        }
        if (hasBones) {
            GL.vertexAttribPointer(5, 4, GL.FLOAT, false, stride, currentOffset);
            currentOffset += (Mesh.prototype.FLOAT_SIZE * 4);

            let boneBuffer = GL.createBuffer();
            GL.bindBuffer(GL.ARRAY_BUFFER, boneBuffer);
            GL.bufferData(GL.ARRAY_BUFFER, new Uint8Array(idArray), GL.STATIC_DRAW);
            GL.vertexAttribIPointer(6, 4, GL.UNSIGNED_BYTE, Mesh.prototype.BYTE_SIZE * 4, 0); //WebGL 2.0 yay!
        }

        let meshData = {};
        meshData.vaoHandle = vao;
        meshData.indexSize = indexArray.length;

        Mesh.calculateBoundingSphere(vertList, meshData);

        Mesh.prototype.meshMap[name] = meshData;
    }

    getSphereCenter() {
      let currentEntry = Mesh.prototype.meshMap[this.name];
      if (!currentEntry) {return this.transform.getWorldPosition(); }
      let center = vec3.transformMat4(vec3.create(), currentEntry.sphere.center, this.transform.getTransformMatrix());
        return center;
    }

  getSphereRadius() {
    let currentEntry = Mesh.prototype.meshMap[this.name];
    if (!currentEntry) {console.log(this.name); return 0; }
    let scale = this.transform.getWorldScale();
    return currentEntry.sphere.radius * scale[0];
  }

    static calculateBoundingSphere(vertList, meshData) {
        let rLength = 1.0/vertList.length;
        let avgPos = vec3.create();
        let tmp = vec3.create();
        for (let vert of vertList) {
            vec3.add(avgPos, avgPos, vec3.scale(tmp, vert, rLength));
        }

        let bestDistance = 0.0;
        for (let vert of vertList) {
            let distance = vec3.distance(avgPos, vert)
            if (distance > bestDistance) {
                bestDistance = distance;
            }
        }

        meshData.sphere = {center: avgPos, radius: bestDistance};
    }
}

Mesh.prototype.BYTE_SIZE = 1; //Unsigned Byte for Bones
Mesh.prototype.FLOAT_SIZE = 4;

Mesh.prototype.POSITION_COUNT = 3;
Mesh.prototype.NORMAL_COUNT = 3;
Mesh.prototype.TANGENT_COUNT = 3;
Mesh.prototype.TEX_COORD_COUNT = 2;
Mesh.prototype.BONE_ID_COUNT = 4;
Mesh.prototype.BONE_WEIGHT_COUNT = 4;

Mesh.prototype.VERTEX_ATTRIB_LOCATION = 0;
Mesh.prototype.NORMAL_ATTRIB_LOCATION = 1;
Mesh.prototype.TEX_COORD_0_ATTRIB_LOCATION = 2;
Mesh.prototype.TANGENT_ATTRIB_LOCATION = 3;
Mesh.prototype.BITANGENT_ATTRIB_LOCATION = 4;
Mesh.prototype.BONE_WEIGHT_ATTRIB_LOCATION = 5;
Mesh.prototype.BONE_ID_ATTRIB_LOCATION = 6;

Mesh.prototype.meshMap = {};
Mesh.prototype.boneIdMap = {};
