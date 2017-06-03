/**
 * Created by Accipiter Chalybs on 5/10/2017.
 */
const c = {
  AIController, Animation, AudioListener, AudioSource, BoxCollider, Camera,
  ClientStickTo, Collider, CompoundCollider, Decal, Light, ParticleSystem,
  SphereCollider, Transform, SingingStatueController, TriggerSwitch, MoveTowardsEvent,
  SingStatueEvent,
  AnimationGraph, AnimationState, DoorEvent, Event, EvilController, HealEvent,
  KeyEvent, Listenable, Look, ObjectLogicState, PlayerController,
  PlayerLogicState, PlayerTable, RaycastSwitch, RotateArrowKey, RotateMouse,
  RotateOverTime, Sing, SingingSwitch, TriggerTest, Viewable, ZoomMouse,
};

const SceneLoader = {

  materialMap: {},
  // All components we load into gameObject
  components: c,
  // Ignore these in general pass, likely because they are already handled specially
  ignoreComponents: ["name", "index", "static", "Kinematic", "Animator", "AnimatorJS", "SkinnedMeshRenderer", "MeshFilter", "MeshRenderer",
                     "Light", "colliders", "Transform", "Rigidbody", "children"],
  shadowLightsAvailable: 0,
  tone: 0,

  loadScene: function(filename) {
    let loadId = GameEngine.registerLoading();
    JsonLoader.loadJSON(filename, SceneLoader._finishLoadScene.bind(this, loadId, filename));
  },

  _finishLoadScene: function(loadId, filename, scene) {

    if (scene === null) {
      return;
    }

    if(!IS_SERVER) {


      for (let matData of scene.materialList) {
        //TODO support more shaders (e.g. animation)
        let forwardShaders = (matData.animated) ? Renderer.FORWARD_PBR_SHADER_ANIM : Renderer.FORWARD_PBR_SHADER;
        let deferredShaders = (matData.animated) ? Renderer.DEFERRED_PBR_SHADER_ANIM : Renderer.DEFERRED_PBR_SHADER;
        let shaderId = (matData.forward) ? forwardShaders : deferredShaders;
        console.log(shaderId, Renderer.FORWARD_PBR_SHADER);
        let mat = new Material(Renderer.getShader(shaderId), !!(matData.forward));
        mat.setTexture(MaterialTexture.COLOR, new Texture(matData.color));
        mat.setTexture(MaterialTexture.MAT, new Texture(matData.mat, false));
        mat.setTexture(MaterialTexture.NORMAL, new Texture(matData.normal, false));
        SceneLoader.materialMap[matData.name] = mat;
      }
      SceneLoader.materialMap['default'] = Debug.makeDefaultMaterial();
    }
    let retScene = SceneLoader._parseNode(GameObject.prototype.SceneRoot, scene.hierarchy, filename, {}, []);

    //ObjectLoader.loadCollision(GameObject.prototype.SceneRoot, "assets/scenes/ExampleLevel_Colliders.json");


    GameEngine.completeLoading(loadId);
  },

  _parseNode: function(parent,  currentNode, filename, loadingAcceleration, lights) {
    let nodeObject = new GameObject({id: currentNode.index});
    parent.addChild(nodeObject);

    let name = currentNode.name;
    if (name === "defaultobject") name = filename + ObjectLoader.prototype.counter;
    nodeObject.setName(name);

    nodeObject.isStatic = (currentNode.static);

    let invParentTransform = mat4.create(); mat4.invert(invParentTransform, parent.transform.getTransformMatrix());

    let pos = vec3.fromValues.apply(vec3, currentNode["Transform"].position);
    pos[2] = -pos[2];

    vec3.transformMat4(pos, pos, invParentTransform);

    let rotate = quat.create();
    quat.rotateY(rotate, rotate, Math.PI);
    quat.rotateY(rotate, rotate, -1*(currentNode["Transform"].rotation[1]) / 180 * Math.PI);
    quat.rotateX(rotate, rotate, 1*(currentNode["Transform"].rotation[0]) / 180 * Math.PI);
    quat.rotateZ(rotate, rotate, -1*(currentNode["Transform"].rotation[2]) / 180 * Math.PI);

    let parentRotation = quat.copy(quat.create(),parent.transform.getWorldRotation());
    quat.normalize(parentRotation, parentRotation);
    quat.invert(parentRotation, parentRotation);
    quat.multiply(rotate, parentRotation, rotate);

    let scale = currentNode["Transform"].scaleFactor;

    nodeObject.transform.setScale(scale);
    nodeObject.transform.setPosition(pos);
    nodeObject.transform.setRotation(rotate);

    //TODO assign index


    if ("colliders" in currentNode) {
      let mass = (currentNode.static) ? 0 : currentNode['Rigidbody'];
      let collider = new CompoundCollider({mass: mass, trigger: false, scaleX: 1, scaleY: 1, scaleZ: 1});
      nodeObject.addComponent(collider);

      for (let colliderData of currentNode["colliders"]) {
        let colliderType = (colliderData.type === 'box') ? 'box' : 'sphere';
        let colliderOffset = vec3.create();//vec3.fromValues.apply(vec3, colliderData.offset);
        let colliderSize = (colliderData.type === 'box') ? vec3.fromValues(colliderData.scaleX, colliderData.scaleY, colliderData.scaleZ)
                                                         : vec3.fromValues(colliderData.scale, colliderData.scale, colliderData.scale);

        //TODO why is the y switched?
        //colliderOffset[1] = -colliderOffset[1];
        vec3.scale(colliderOffset, colliderOffset, scale);
        vec3.scale(colliderSize, colliderSize, scale);

        collider.setPhysicsMaterial(PhysicsEngine.materials.basicMaterial);
        collider.setTrigger(colliderData.isTrigger);
        collider.addShape(colliderType, colliderSize, colliderOffset);
      }

      if(currentNode["Kinematic"] !== undefined){
        collider.setLayer(FILTER_KINEMATIC);
      }else {
        collider.setLayer(FILTER_LEVEL_GEOMETRY);
      }
    }

    if ('Light' in currentNode) {
      let lightData = currentNode['Light'];
      if (lightData.type === 'Point') {
        let light = new PointLight(SceneLoader.shadowLightsAvailable-- > 0, nodeObject.isStatic);
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
      if ("MeshFilter" in currentNode || "SkinnedMeshRenderer" in currentNode) {
        let meshName = currentNode["MeshFilter"] || currentNode["SkinnedMeshRenderer"].name;
        if (meshName === 'Plane' || meshName === 'Cube' || meshName === 'Sphere' || meshName === 'Capsule') {
          console.log(meshName = 'SceneLoader');
        //  nodeObject.transform.scale(5);
          nodeObject.transform.rotateX(Math.PI/2);
        }
        let mesh = new Mesh(meshName);

//TEMP
        let materialName = currentNode["MeshRenderer"] || currentNode["SkinnedMeshRenderer"].material;
        if (!SceneLoader.materialMap[materialName]) {
          console.log(meshName, materialName);
          materialName = 'default';
        }
        mesh.setMaterial(SceneLoader.materialMap[materialName]);

        nodeObject.addComponent(mesh);
      }
    }

    //Handle other general components
    for (let generalCompName of Object.keys(currentNode)) {
      if (SceneLoader.ignoreComponents.indexOf(generalCompName) >= 0) continue;
      let compData = currentNode[generalCompName];
      // Debug.log(currentNode, generalCompName, compData);
      // Debug.log(c[generalCompName]);
      // Debug.log(compData);

      switch (generalCompName) {
        case "PlayerController":
          PlayerTable.addPlayer(nodeObject);
          nodeObject.addComponent(new PlayerController());
          break;
        default:
          nodeObject.addComponent(new c[generalCompName](compData));
          break;
      }
    }

    //TODO there's probably a better way to do this...
    if ('AnimatorJS' in currentNode) {
      loadingAcceleration = {};
    }

    loadingAcceleration[currentNode.name] = nodeObject.transform;
    if (Object.keys(currentNode).indexOf("children") >= 0) {
      for (let child of currentNode.children) {
        SceneLoader._parseNode(nodeObject, child, filename, loadingAcceleration, lights);
      }
    }

    if ('AnimatorJS' in currentNode) {
      let animComponent = new Animation({name: currentNode['AnimatorJS'].animationName});
      animComponent.link(loadingAcceleration);
      nodeObject.addComponent(animComponent);
      SceneLoader.linkRoot(animComponent, nodeObject.transform);
    }

    return nodeObject;
  },

  linkRoot : function(anim, currentTransform) {
    if (!currentTransform) return;

    let currentMesh = currentTransform.gameObject.getComponent("Mesh");
    if (currentMesh && currentMesh !== null) {
      currentMesh.animationRoot = anim;
    }
    for (let child of currentTransform.children) {
      SceneLoader.linkRoot(anim, child);
    }
  }

};