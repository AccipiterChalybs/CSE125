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
      for (let animInfo of animationFiles[animationName].info) {
        let indexMap = {};
        for (let loadIndex of animInfo[1]) {
          indexMap[loadIndex] = index++;
        }
        ObjectLoader.loadAnimation(animationName, animInfo[0], indexMap, animationFiles[animationName].metaData);
        // console.log(`${animFilename} loaded in ...`);
        // console.log(indexMap);
      }
    }

    // Animations graphs loaded here, for now
    AnimationGraph.loadPlayerAnimationGraph();

    SceneLoader.loadScene(sceneFile);

    // TODO REMOVE ME LATER
    NavMesh.prototype.currentNavMesh = new NavMesh();

    if (!IS_SERVER) {
      PrefabFactory.init();
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
    if (!IS_SERVER) {
      // camera.transform.setPosition(newPosition);
      camera.gameObject.addComponent(new RotateMouse());
    }

    //TODO make true and make clientside objects work
    let directionalLight = new GameObject({ clientSideOnly: false });

    if (!IS_SERVER) {
      Renderer.directionalLight = directionalLight;
      Renderer.directionalLight.setName('DirectionalLight');
      Renderer.directionalLight.addComponent(new DirectionalLight(true));
      Renderer.directionalLight.addComponent(new ClientStickTo({ target: Renderer.camera.transform.getParent().gameObject, offset: vec3.create() }));
      Renderer.directionalLight.transform.rotateY(-Math.PI / 3.0);
      Renderer.directionalLight.transform.rotateX(-Math.PI / 4.0);

      Renderer.directionalLight.getComponent('Light').color = vec3.fromValues(1.6, 3.2, 6.4);
    }

    let pos = vec3.create(); vec3.set(pos, 26, 0, 18);
    let color = vec4.create(); vec4.set(color, 1, 0, 0, 1);
    let evilTeapot = Debug.drawTeapot(pos, color);
    evilTeapot.addComponent(new EvilController());

    // let container = new GameObject();
    // let ids = [];
    // container.transform.scale(.05);
    //
    // for (let i = 0; i < 4; i++) {
    //   let a = new GameObject({clientSideOnly:false});
    //   a.addComponent(new PointLight())
    //   // a.addComponent(new SingingStatueController({singingDelay: 0, singingDuration: 3}));
    //   a.addComponent(new Sing({range: 2, light: a.id, lightIntensity: 1, maxLightRange: 3, minLightRange: 0}));
    //   a.getComponent("Light").setColor([1-(.25*i),.25*i,0]);
    //   a.getComponent("Light").setRange(0);
    //   if(!IS_SERVER) {
    //     let mesh = new Mesh("Teapot02");
    //     let mat = new Material(Renderer.getShader(Renderer.DEFERRED_PBR_SHADER));
    //     let color = vec4.create();
    //     vec4.set(color, 0.81, 0.81, 0.81, 1);
    //     mat.setTexture(MaterialTexture.COLOR, Texture.makeColorTex(color));
    //
    //     vec4.set(color, 0.5, 0.5, 1, 1);
    //     mat.setTexture(MaterialTexture.NORMAL, Texture.makeColorTex(color));
    //
    //     vec4.set(color, 0, 0, 0, 1); //metalness, blank, roughness
    //     mat.setTexture(MaterialTexture.MAT, Texture.makeColorTex(color));
    //     mesh.setMaterial(mat);
    //     a.addComponent(mesh);
    //   }
    //   let idx = i+9;
    //   a.addComponent(new AudioSource({audioName:'Tone1.wav_'+idx}));
    //   a.addComponent(new SimonSaysSwitch({events : [container.id], maximumOutput: 5, lossRate: 0.5, timeBeforeLoss: 2}))
    //   a.transform.setPosition([30*i, 0, i*.25]);
    //   container.addChild(a);
    //   ids.push(a.id);
    // }
    //
    // container.addComponent(new SimonSays({ unparsedStatues: ids, order: [0, 1, 2, 3],singDuration:5,cycleDuration:5 }));
    //
    // container.transform.setPosition( [12.319365501403809, 0.15055914223194122, 0.757758617401123]);
    // GameObject.prototype.SceneRoot.addChild(container);

    GameObject.prototype.SceneRoot.findComponents('Listenable', PhysicsEngine.sphereChecks);


  }

  update() {
    // -- Physics update call will likely go here --

    if (Debug.clientUpdate)
    {
      Debug.Profiler.startTimer('Physics', 2);
      PhysicsEngine.update();
      Debug.Profiler.endTimer('Physics', 2);
    }

    if (!IS_SERVER) {
      Debug.Profiler.startTimer('GameLogic', 2);
      PrefabFactory.updateClient();
      Renderer.camera.transform.getParent().getParent().gameObject.updateClient();
      if (Renderer.directionalLight) Renderer.directionalLight.updateClient();
      Debug.Profiler.endTimer('GameLogic', 2);
    }
  }
}
