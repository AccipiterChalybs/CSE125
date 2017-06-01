/**
 * Created by Accipiter Chalybs on 4/14/2017.
 */
var decalTex, decalNormal;

var particleTex;

class GameScene {
  constructor(sceneFile, meshFileList, animationFiles) {
    GameObject.prototype.SceneRoot = new GameObject();
    //Start loads here, do stuff with created objects in start()
    for (let filename of meshFileList) {
      ObjectLoader.loadMeshes(filename);
    }

    for (let animationName of Object.keys(animationFiles)) {
      let index = 0;
      for (let animFilename of Object.keys(animationFiles[animationName])) {
        let indexMap = {};
        for (let loadIndex of animationFiles[animationName][animFilename]) {
          indexMap[loadIndex] = index++;
        }
        ObjectLoader.loadAnimation(animationName, animFilename, indexMap);
      }
    }

    // Animations graphs loaded here, for now
    AnimationGraph.loadPlayerAnimationGraph();

    SceneLoader.loadScene(sceneFile);

    // TODO REMOVE ME LATER
    NavMesh.prototype.currentNavMesh = new NavMesh();


    if (!IS_SERVER) {
      decalTex = new Texture('assets/texture/test_decal2.png');
      decalNormal = new Texture('assets/texture/test_decal_normal.png', false);
      particleTex = new Texture('assets/texture/particle_fire_test.png');
    }
  }

  start() {
    let camera = new Camera();
    new GameObject().addComponent(camera);
    let rootTest = new GameObject();
    let rotationCam = new GameObject();
    rotationCam.transform.setParent(rootTest.transform);
    camera.gameObject.transform.setParent(rotationCam.transform);
    camera.gameObject.addComponent(new AudioListener());
    camera.gameObject.addComponent(new ZoomMouse());
    // let newPosition = vec3.create(); vec3.set(newPosition, 0, 0, 5);
    if(!IS_SERVER){
      // camera.transform.setPosition(newPosition);
      camera.gameObject.addComponent(new RotateMouse());
    }


    //TODO make true and make clientside objects work
    let directionalLight = new GameObject({clientSideOnly: false});

    if(!IS_SERVER) {
      Renderer.directionalLight = directionalLight;
      Renderer.directionalLight.setName("DirectionalLight");
      Renderer.directionalLight.addComponent(new DirectionalLight(true));
      Renderer.directionalLight.addComponent(new ClientStickTo({target: Renderer.camera.transform.getParent().gameObject, offset: vec3.create()}));
      Renderer.directionalLight.transform.rotateY(-Math.PI / 3.0);
      Renderer.directionalLight.transform.rotateX(-Math.PI / 4.0);

      Renderer.directionalLight.getComponent("Light").color = vec3.fromValues(1.6, 3.2, 6.4);
    }

    let pos = vec3.create(); vec3.set(pos, -27, 0, -9);
    let color = vec4.create(); vec4.set(color, 1, 0, 0, 1);
    let evilTeapot = Debug.drawTeapot(pos, color);
    evilTeapot.addComponent(new EvilController());

    GameObject.prototype.SceneRoot.findComponents("Listenable", PhysicsEngine.sphereChecks);

  }

  update() {
    // -- Physics update call will likely go here --

    if(Debug.clientUpdate)
    {
      Debug.Profiler.startTimer('Physics', 2);
      PhysicsEngine.update();
      Debug.Profiler.endTimer('Physics', 2);
    }

    if (!IS_SERVER){
      Debug.Profiler.startTimer('GameLogic', 2);
      Renderer.camera.transform.getParent().getParent().gameObject.updateClient();
      if (Renderer.directionalLight) Renderer.directionalLight.updateClient();
      Debug.Profiler.endTimer('GameLogic', 2);
    }
  }
}
