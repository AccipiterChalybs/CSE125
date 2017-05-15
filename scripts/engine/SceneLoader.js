/**
 * Created by Accipiter Chalybs on 5/10/2017.
 */

const SceneLoader = {

  materialMap: {},
  shadowLightsAvailable: 0,

  loadScene: function(filename) {
    let loadId = GameEngine.registerLoading();
    JsonLoader.loadJSON(filename, SceneLoader._finishLoadScene.bind(this, loadId, filename));
  },

  _finishLoadScene: function(loadId, filename, scene) {

    if (scene === null) {
      return;
    }

    for (let matData of scene.materialList) {
      //TODO support more shaders (e.g. animation)
      let mat = new Material(Renderer.getShader(Renderer.DEFERRED_PBR_SHADER), false);
      mat.setTexture(MaterialTexture.COLOR, new Texture(matData.color));
      mat.setTexture(MaterialTexture.MAT, new Texture(matData.mat, false));
      mat.setTexture(MaterialTexture.NORMAL, new Texture(matData.normal, false));
      SceneLoader.materialMap[matData.name] = mat;
    }
    SceneLoader.materialMap['default'] = Debug.makeDefaultMaterial();

    let loadingAcceleration = {};

    let retScene = SceneLoader._parseNode(GameObject.prototype.SceneRoot, scene.hierarchy, filename, loadingAcceleration, []);


    //ObjectLoader.loadCollision(GameObject.prototype.SceneRoot, "assets/scenes/ExampleLevel_Colliders.json");


    GameEngine.completeLoading(loadId);
  },

  _parseNode: function(parent,  currentNode, filename, loadingAcceleration, lights) {
    let nodeObject = new GameObject();
    parent.addChild(nodeObject);

    let name = currentNode.name;
    if (name === "defaultobject") name = filename + ObjectLoader.prototype.counter;
    nodeObject.setName(name);

    let invParentTransform = mat4.create(); mat4.invert(invParentTransform, parent.transform.getTransformMatrix());

    let pos = vec3.fromValues.apply(vec3, currentNode["Transform"].position);
    pos[2] = -pos[2];

    vec3.transformMat4(pos, pos, invParentTransform);

    let rotate = quat.create();
    quat.rotateY(rotate, rotate, Math.PI);
    quat.rotateY(rotate, rotate, -1*(currentNode["Transform"].rotation[1]) / 180 * Math.PI);
    quat.rotateX(rotate, rotate, 1*(currentNode["Transform"].rotation[0]) / 180 * Math.PI);
    quat.rotateZ(rotate, rotate, -1*(currentNode["Transform"].rotation[2]) / 180 * Math.PI);

    quat.multiply(rotate, mat4.getRotation(quat.create(), invParentTransform), rotate);

    let scale = currentNode["Transform"].scaleFactor;

    nodeObject.transform.setScale((scale > 10) ? scale / 100 : scale);
    nodeObject.transform.setPosition(pos);
    nodeObject.transform.setRotation(rotate);


    if ("colliders" in currentNode) {
      //TODO give mass
      let collider = new CompoundCollider(0, false, 1, 1, 1);
      nodeObject.addComponent(collider);

      for (let colliderData of currentNode["colliders"]) {
        let colliderType = (colliderData.type === 'box') ? 'box' : 'sphere';
        let colliderOffset = vec3.fromValues.apply(vec3, colliderData.offset);
        let colliderSize = (colliderData.type === 'box') ? vec3.fromValues(colliderData.scaleX, colliderData.scaleY, colliderData.scaleZ)
                                                         : vec3.fromValues(colliderData.scale, colliderData.scale, colliderData.scale);

        //TODO why is the y switched?
        colliderOffset[1] = -colliderOffset[1];
        vec3.scale(colliderOffset, colliderOffset, scale);
        vec3.scale(colliderSize, colliderSize, scale);

        collider.addShape(colliderType, colliderSize, colliderOffset);
      }
      collider.setLayer(FILTER_LEVEL_GEOMETRY);
    }

    if ('Light' in currentNode) {
      let lightData = currentNode['Light'];
      if (lightData.type === 'Point') {
        let light = new PointLight(SceneLoader.shadowLightsAvailable-- > 0);
        light.color = vec3.fromValues(lightData.color[1], lightData.color[2], lightData.color[3]);
        vec3.scale(light.color, light.color, lightData.intensity);
        light.range = lightData.range;
        nodeObject.addComponent(light);

        //nodeObject.addComponent(new Mesh("Sphere_Icosphere"));
        //nodeObject.getComponent("Mesh").setMaterial(Debug.makeDefaultMaterial());
      }
    }


    if (!IS_SERVER) {

      //TODO check spelling of SkinnedMeshRenderer
      if ("MeshFilter" in currentNode) {//|| "SkinnedMeshRenderer" in currentNode) {
        let meshName = currentNode["MeshFilter"];
        if (meshName === 'Plane' || meshName === 'Cube' || meshName === 'Sphere' || meshName === 'Capsule') {
          console.log(meshName = 'Plane');
          nodeObject.transform.scale(5);
          nodeObject.transform.rotateX(Math.PI/2);
        }
        let mesh = new Mesh(meshName);

//TEMP
        let materialName = currentNode["MeshRenderer"];
        if (!SceneLoader.materialMap[materialName]) {
          console.log(materialName);
          materialName = 'default';
        }
        mesh.setMaterial(SceneLoader.materialMap[materialName]);

        nodeObject.addComponent(mesh);

/*
        let aMat = scene.materials[scene.meshes[currentNode.meshes[0]].materialindex];
        let foundForward = name.search("Forward") !== -1;
        let foundEmit = name.search("Emit") !== -1;
        let mat = null;

        //TODO either change material to accept an index, or pass in the shader object from Renderer
        let hasBones = ("bones" in scene.meshes[currentNode.meshes[0]]);
        if (foundForward) {
          mat = new Material(Renderer.getShader(hasBones ? Renderer.FORWARD_PBR_SHADER_ANIM : Renderer.FORWARD_UNLIT));
          mat.transparent = true;
        }
        else if (foundEmit) {
          mat = new Material(Renderer.getShader(Renderer.FORWARD_EMISSIVE));
          mat.transparent = true;
        } else {
          mat = new Material(Renderer.getShader(hasBones ? Renderer.DEFERRED_PBR_SHADER_ANIM : Renderer.DEFERRED_PBR_SHADER));
          mat.transparent = false;
        }


        //TODO make it load textures!
        if (false && aMat.GetTextureCount("aiTextureType_DIFFUSE") > 0) {
          let path = null;
          aMath.GetTexture(aiTextureType_DIFFUSE, 0, path);
          mat.setTexture(MaterialTexture.COLOR, new Texture(getPath(filename) + path, true))
        }
        else {
          let color = vec4.create();
          vec4.set(color, 1, 1, 1, 1);
          mat.setTexture(MaterialTexture.COLOR, Texture.makeColorTex(color))
        }

        if (false && aMat.GetTextureCount("aiTextureType_NORMALS") > 0) {
          let path = null;
          aMath.GetTexture(aiTextureType_NORMALS, 0, path);
          mat.setTexture(MaterialTexture.NORMAL, new Texture(getPath(filename) + path, false))
        }
        else {
          let color = vec4.create();
          vec4.set(color, 0.5, 0.5, 1, 1);
          mat.setTexture(MaterialTexture.NORMAL, Texture.makeColorTex(color))
        }

        if (false && aMat.GetTextureCount("aiTextureType_SPECULAR") > 0) {
          let path = null;
          aMath.GetTexture(aiTextureType_DIFFUSE, 0, path);
          mat.setTexture(MaterialTexture.MAT, new Texture(getPath(filename) + path, false));
        }
        else {
          let color = vec4.create();
          vec4.set(color, 0, 0, 0.25, 1); //metalness, blank, roughness
          mat.setTexture(MaterialTexture.MAT, Texture.makeColorTex(color))
        }
        */

      }
    }

    loadingAcceleration[currentNode.name] = nodeObject.transform;
    if (Object.keys(currentNode).indexOf("children") >= 0) {
      for (let child of currentNode.children) {
        SceneLoader._parseNode(nodeObject, child, filename, loadingAcceleration, lights);
      }
    }

    return nodeObject;
  }


};