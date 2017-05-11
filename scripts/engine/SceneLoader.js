/**
 * Created by Accipiter Chalybs on 5/10/2017.
 */

const SceneLoader = {

  materialMap: {},

  loadScene: function(filename) {
    let loadId = GameEngine.registerLoading();
    JsonLoader.loadJSON(filename, SceneLoader._finishLoadScene.bind(this, loadId, filename));
  },

  _finishLoadScene: function(loadId, filename, scene) {

    if (scene === null) {
      return;
    }

    console.log(scene);
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

    let retScene = SceneLoader._parseNode(scene, scene.hierarchy, filename, loadingAcceleration, []);

    GameObject.prototype.SceneRoot.addChild(retScene);

    //ObjectLoader.loadCollision(GameObject.prototype.SceneRoot, "assets/scenes/ExampleLevel_Colliders.json");


    GameEngine.completeLoading(loadId);
  },

  _parseNode: function(scene,  currentNode, filename, loadingAcceleration, lights) {
    let nodeObject = new GameObject();

    let name = currentNode.name;
    if (name === "defaultobject") name = filename + ObjectLoader.prototype.counter;
    nodeObject.setName(name);

    let pos = vec3.fromValues.apply(vec3, currentNode["Transform"].position);
    pos[2] = -pos[2];
    //TODO may need to edit rotation due to z-axis change
    let w=currentNode["Transform"].rotation[0];
    let x=currentNode["Transform"].rotation[1];
    let y=currentNode["Transform"].rotation[2];
    let z=currentNode["Transform"].rotation[3];
    let rotate = quat.fromValues.apply(quat, [x, y, z, w]);
    //rotate[2] = -rotate[2];
    let scale = currentNode["Transform"].scaleFactor;
    if (scale > 10) scale /= 100;

    nodeObject.transform.setScale(scale);
    nodeObject.transform.setPosition(pos);
    nodeObject.transform.setRotation(rotate);

    if ("colliders" in currentNode) {
      //TODO give mass
      let collider = new CompoundCollider(0, false, 1, 1, 1);
      nodeObject.addComponent(collider);

      for (let colliderData of currentNode["colliders"]) {
        colliderData.offset[2] = colliderData.offset[2];
        vec3.scale(colliderData.offset, colliderData.offset, 100*scale);
        if (colliderData.type === 'box') {
          collider.addShape('box',[colliderData.scaleX*50*scale, colliderData.scaleY*50*scale, colliderData.scaleZ*50*scale], colliderData.offset);
        } else {
          collider.addShape('sphere', [colliderData.scale, colliderData.scale, colliderData.scale], colliderData.offset);
        }
      }
      collider.setLayer(FILTER_LEVEL_GEOMETRY);
    }

    let shadowAvailable = 0;
    if ('Light' in currentNode) {
      let lightData = currentNode['Light'];
      if (lightData.type === 'Point') {
        let light = new PointLight(true);
        light.color = vec3.fromValues(lightData.color[1], lightData.color[2], lightData.color[3]);
        vec3.scale(light.color, light.color, lightData.intensity);
        nodeObject.addComponent(light);

        //nodeObject.addComponent(new Mesh("Sphere_Icosphere"));
        //nodeObject.getComponent("Mesh").setMaterial(Debug.makeDefaultMaterial());
      }
    }


    if (!IS_SERVER) {

      //TODO check spelling of SkinnedMeshRenderer
      if ("MeshFilter" in currentNode || "SkinnedMeshRenderer" in currentNode) {
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
      GO = new GameObject();
      for (let child of currentNode.children) {
        GO.addChild(SceneLoader._parseNode(scene, child, filename, loadingAcceleration, lights));
      }
      GO.addChild(nodeObject);
      return GO;
    }

    return nodeObject;
  }


};