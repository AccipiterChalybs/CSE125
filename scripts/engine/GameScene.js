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
    //GameObject.prototype.SceneRoot.transform.children[0].gameObject.getComponent('Animation').play(0, true);


    GameObject.prototype.SceneRoot.transform.setScale(1);

    let rotation = quat.create();
    quat.rotateX(rotation, rotation, -Math.PI/2);

    let container = new GameObject();
    GameObject.prototype.SceneRoot.addChild(container);

    let metalNum = 10;
    let roughNum = 10;
    let separation = 0.5;
    let yHeight = 1;
    let quickEvent = null;
    for (let x=0; x<metalNum; ++x) {
        for (let y=0; y<roughNum; ++y) {
            let specialTeapot = false;

            let teapot = new GameObject();

            if (!IS_SERVER) {
              let mesh = new Mesh("Teapot02");
              let mat = new Material(Renderer.getShader(Renderer.DEFERRED_PBR_SHADER));

              let color = vec4.create();
              vec4.set(color, 0.81, 0.81, 0.81, 1);
              mat.setTexture(MaterialTexture.COLOR, Texture.makeColorTex(color));

              vec4.set(color, 0.5, 0.5, 1, 1);
              mat.setTexture(MaterialTexture.NORMAL, Texture.makeColorTex(color));

              vec4.set(color, x / (metalNum - 1), 0, y / (roughNum - 1), 1); //metalness, blank, roughness
              mat.setTexture(MaterialTexture.MAT, Texture.makeColorTex(color));

              if (x===1 && y===1){
                vec4.set(color, 1, 0, 0, 1);
                mat.setTexture(MaterialTexture.COLOR, Texture.makeColorTex(color));
              }else if( x===9 && y ===5){
                vec4.set(color, 0, 1, 0, 1);
                mat.setTexture(MaterialTexture.COLOR, Texture.makeColorTex(color));
              }else if( x===4 && y ===3){
                vec4.set(color, .5, .0, 0, 1);
                mat.setTexture(MaterialTexture.COLOR, Texture.makeColorTex(color));
              }else if( x===9 && y ===3){
                vec4.set(color, 1, 0, 1, 1);
                mat.setTexture(MaterialTexture.COLOR, Texture.makeColorTex(color));
              }else if( x===2 && y ===2){
                vec4.set(color, 0, 0, 1, 1);
                mat.setTexture(MaterialTexture.COLOR, Texture.makeColorTex(color));
              }

              mesh.setMaterial(mat);
              teapot.addComponent(mesh);
            }

          let pos = vec3.create(); vec3.set(pos, (x - metalNum/2.0)*separation, yHeight, -1 * (y - roughNum/2.0)*separation);
            if (x===5 && y===5) {
              //add sound to a GameObject
              //teapot.addComponent(new AudioSource());
              //if(!IS_SERVER) teapot.getComponent("AudioSource").playSound3d("cruelangel");
              if(!Debug.quickLoad) {
                if (!IS_SERVER) teapot.addComponent(new ParticleSystem({additive: true, texture: particleTex}));

                let decal = new GameObject();
                teapot.addChild(decal);
                decal.addComponent(new Decal({
                  scale: 200,
                  color: vec4.fromValues(0.5, 25, 0.5, 1),
                  texture: decalTex,
                  normal: decalNormal
                }));
                decal.transform.setPosition(vec3.fromValues(0, 30, 60));
                decal.transform.rotateX(Math.PI / 2);
              }

            }

            if(x===1 && y===1){
              pos[1] = 0;
            } else if(x===2 && y===2){
              pos[1] = 0;
            }
            teapot.transform.setPosition(pos);
            teapot.transform.setRotation(rotation);
            teapot.transform.scale((0.01));

            if (x===1 && y===1){
              teapot.addComponent(new SphereCollider({mass: 0, trigger: true}));
              teapot.getComponent('Collider').setLayer(FILTER_KINEMATIC);
              let doorEvent = new DoorEvent({openPos: [-2,2,2], closePos: [-2,0,2],unlocked:false});
              teapot.addComponent(new EventContainer({ events:[doorEvent] }));
              teapot.addComponent(new AudioSource("door_unlocked"));
              teapot.addComponent(new SingingSwitch({events: [doorEvent],activationLevel:5,time_before_loss:3 }));
              quickEvent = doorEvent;

              if(!IS_SERVER) {
                //teapot.getComponent("AudioSource").playSound2d('door_unlocked');
                //teapot.getComponent("AudioSource").pauseSound();
              }

              specialTeapot = true;

            }else if(x===9 && y===5){
              teapot.addComponent(new SphereCollider({mass: 100, trigger: false, scale:15}));
              teapot.getComponent('Collider').setLayer(FILTER_KINEMATIC);
              teapot.addComponent(new RaycastSwitch({events: [quickEvent]}));
              teapot.transform.position[1]=0;
              teapot.transform.scale(1.5);

              specialTeapot = true;

            }else if(x===4 && y===3){
              teapot.addComponent(new SphereCollider({mass: 100, trigger: false, scale: 15}));
              teapot.transform.scale(.5);
              teapot.getComponent('Collider').setLayer(FILTER_KINEMATIC);
              let keyEvent = new KeyEvent();
              teapot.addComponent(new EventContainer({events: [keyEvent]}));
              teapot.addComponent(new AudioSource("get_item"));
              teapot.transform.position[1]=0;
              teapot.addComponent(new RaycastSwitch({events: [keyEvent]}));

              if(!IS_SERVER) {
                //teapot.getComponent("AudioSource").playSound2d('get_item');
                //teapot.getComponent("AudioSource").pauseSound();
              }
              specialTeapot = true;
            }else if(x===9 && y===3){
              teapot.addComponent(new SphereCollider({mass: 100, trigger: false, scale: 15}));
              teapot.transform.scale(1.1);
              teapot.getComponent('Collider').setLayer(FILTER_KINEMATIC);

              let healEvent = new HealEvent();
              let checkpointEvent = new CheckpointEvent();
              teapot.addComponent(new EventContainer({events: [checkpointEvent,healEvent]}));
              teapot.addComponent(new AudioSource('heal'));
              teapot.addComponent(new RaycastSwitch({events: [checkpointEvent,healEvent]}));
              if(!IS_SERVER) {
                //teapot.getComponent("AudioSource").playSound();
                //teapot.getComponent("AudioSource").pauseSound();
              }
              teapot.transform.position[1]=0;
              specialTeapot = true;
            }else if(x===2 && y===2){
              teapot.addComponent(new SphereCollider({mass: 0, trigger: true}));
              // teapot.addComponent(new AudioSource());
              teapot.addComponent(new TriggerTest());

              // if(!IS_SERVER) {
              //   teapot.getComponent('AudioSource').playSound2d('singTone03');
              //   teapot.getComponent('AudioSource').pauseSound();
              // }
              specialTeapot = true;

              //For testing purposes
              /*light.addComponent(new Mesh("Sphere_Icosphere"));
               light.getComponent("Mesh").setMaterial(Debug.makeDefaultMaterial());*/
              //light.transform.scale(0.25);


            }else if (x===3 && y===3){
              teapot.addComponent(new SphereCollider({mass: 100, trigger: false, scale: 15}));
              teapot.transform.scale(1.1);
              teapot.getComponent('Collider').setLayer(FILTER_KINEMATIC);
              let lightHolder = new GameObject();
              lightHolder.addComponent(new PointLight(false));
              teapot.addChild(lightHolder);
              teapot.addComponent(new AudioSource("Tone02"));
              teapot.addComponent(new Sing({}));
              teapot.addComponent(new StatueController({lightColor:[.5,3,4,1], lightRange: 1, singingCooldown: 2}));

              // if(!IS_SERVER) {
              //   teapot.getComponent("AudioSource").playSound2d('singTone02');
              //   teapot.getComponent("AudioSource").pauseSound();
              // }
              teapot.transform.position[1]=0;
              specialTeapot = true;
            }else if(x===6){
              teapot.addComponent(new SphereCollider({mass: 10, trigger: false, scale: 15}));
              teapot.transform.scale(1.1);
              teapot.getComponent('Collider').setLayer(FILTER_DEFAULT);
              let lightholder = new GameObject();
              lightholder.addComponent(new PointLight(false));
              teapot.addChild(lightholder);
              teapot.addComponent(new StatueController({lightColor:[.5,3,4,1], lightRange: 1, singingCooldown: 2}));
              let moveTowardsEvent= new MoveTowardsEvent({target: PlayerTable.players[0]});
              teapot.addComponent(new EventContainer({events:[moveTowardsEvent]}));
              teapot.addComponent(new SingingSwitch({events: [moveTowardsEvent],activationLevel: .5,time_before_loss: 0.1}));
              teapot.transform.position[1]=0;
              specialTeapot = true;
            }else{
              teapot.addComponent(new SphereCollider({mass: 100, triger: false, scale: 10})); //set Transform BEFORE collider
            }

            if (specialTeapot) {
              container.addChild(teapot);
            }
        }
    }


    // GameObject.prototype.SceneRoot.transform.children[1].children[13].gameObject.getComponent("Collider").setLayer(FILTER_KINEMATIC);
    // GameObject.prototype.SceneRoot.transform.children[1].children[93].gameObject.addComponent(new RaycastSwitch(GameObject.prototype.SceneRoot.transform.children[1].children[93].gameObject.getComponent("Event"),5));
    //
    // GameObject.prototype.SceneRoot.transform.children[1].children[13].position[1]=0;
    // GameObject.prototype.SceneRoot.transform.children[1].children[43].position[1]=0;

    // GameObject.prototype.SceneRoot.transform.children[0].children[1].gameObject.getComponent("Collider").setLayer(FILTER_LEVEL_GEOMETRY);
    // GameObject.prototype.SceneRoot.transform.children[1].children[55].gameObject.getComponent("Collider").setLayer(FILTER_PLAYER);

    // PlayerTable.addPlayer(GameObject.prototype.SceneRoot.transform.children[1].children[55].gameObject);
    // GameObject.prototype.SceneRoot.transform.children[1].children[55].gameObject.addComponent(new Sing());
    // GameObject.prototype.SceneRoot.transform.children[1].children[55].gameObject.addComponent(new Look());
    // GameObject.prototype.SceneRoot.transform.children[1].children[55].gameObject.addComponent(new AudioSource());
    // if(!Debug.clientUpdate) {
    //
    //   GameObject.prototype.SceneRoot.transform.children[1].children[56].gameObject.addComponent(new Sing());
    //   GameObject.prototype.SceneRoot.transform.children[1].children[56].gameObject.addComponent(new AudioSource());
    //   GameObject.prototype.SceneRoot.transform.children[1].children[56].gameObject.addComponent(new Look());
    //   GameObject.prototype.SceneRoot.transform.children[1].children[57].gameObject.addComponent(new Sing());
    //   GameObject.prototype.SceneRoot.transform.children[1].children[57].gameObject.addComponent(new AudioSource());
    //   GameObject.prototype.SceneRoot.transform.children[1].children[57].gameObject.addComponent(new Look());
    //   GameObject.prototype.SceneRoot.transform.children[1].children[58].gameObject.addComponent(new Sing());
    //   GameObject.prototype.SceneRoot.transform.children[1].children[58].gameObject.addComponent(new AudioSource());
    //   GameObject.prototype.SceneRoot.transform.children[1].children[58].gameObject.addComponent(new Look());
    //   //
    //   //
    //   PlayerTable.addPlayer(GameObject.prototype.SceneRoot.transform.children[1].children[56].gameObject);
    //   GameObject.prototype.SceneRoot.transform.children[1].children[56].gameObject.addComponent(new PlayerController());
    //   PlayerTable.addPlayer(GameObject.prototype.SceneRoot.transform.children[1].children[57].gameObject);
    //   GameObject.prototype.SceneRoot.transform.children[1].children[57].gameObject.addComponent(new PlayerController());
    //   PlayerTable.addPlayer(GameObject.prototype.SceneRoot.transform.children[1].children[58].gameObject);
    //   GameObject.prototype.SceneRoot.transform.children[1].children[58].gameObject.addComponent(new PlayerController());
    // }
    // if(!IS_SERVER) {
    //   // GameObject.prototype.SceneRoot.transform.children[1].children[55].gameObject.getComponent("AudioSource").playSound2d("singTone00");
    //   // GameObject.prototype.SceneRoot.transform.children[1].children[55].gameObject.getComponent("AudioSource").pauseSound();
    //   if(!Debug.clientUpdate) {
    //     GameObject.prototype.SceneRoot.transform.children[1].children[56].gameObject.getComponent("AudioSource").playSound2d("singTone01");
    //     GameObject.prototype.SceneRoot.transform.children[1].children[56].gameObject.getComponent("AudioSource").pauseSound();
    //     GameObject.prototype.SceneRoot.transform.children[1].children[57].gameObject.getComponent("AudioSource").playSound2d("singTone02");
    //     GameObject.prototype.SceneRoot.transform.children[1].children[57].gameObject.getComponent("AudioSource").pauseSound();
    //     GameObject.prototype.SceneRoot.transform.children[1].children[58].gameObject.getComponent("AudioSource").playSound2d("singTone03");
    //     GameObject.prototype.SceneRoot.transform.children[1].children[58].gameObject.getComponent("AudioSource").pauseSound();
    //   }
    // }

    //TODO make true and make clientside objects work
    let directionalLight = new GameObject(false);

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

    //let move = vec3.create(); vec3.set(move, 0, 500, 64);
    let move = vec3.create(); vec3.set(move, 0,-1,0);
    let ground = new GameObject();
    ground.setName("ground");
    ground.transform.setPosition(move);
    let box = new BoxCollider({mass: 0, trigger: false, scaleX: 10000, scaleY: 1, scaleZ: 10000});
    ground.addComponent(box);
    ground.getComponent("Collider").setPhysicsMaterial(PhysicsEngine.materials.basicMaterial);
    ground.getComponent("Collider").setLayer(FILTER_LEVEL_GEOMETRY);


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
