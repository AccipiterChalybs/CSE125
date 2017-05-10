/**
 * Created by Accipiter Chalybs on 4/14/2017.
 */

var albedo, mat, normal;

class GameScene {
  constructor(filenameList) {
    GameObject.prototype.SceneRoot = new GameObject();
    //Start loads here, do stuff with created objects in start()
    for (let filename of filenameList) {
        ObjectLoader.loadScene(filename); //TODO add callback to group these together
    }

    // TODO REMOVE ME LATER
    NavMesh.prototype.currentNavMesh= new NavMesh();

    if (!IS_SERVER) {
      albedo = new Texture('assets/texture/dungeon-stone1-albedo2.png');
      mat = new Texture('assets/texture/dungeon-stone1-mat.png', false);
      normal = new Texture('assets/texture/dungeon-stone1-normal.png', false);
    }
  }

  start() {
    let camera = new Camera();
    new GameObject().addComponent(camera);
    let rootTest = new GameObject();
    camera.gameObject.transform.setParent(rootTest.transform);
    camera.gameObject.addComponent(new AudioListener());
    camera.gameObject.addComponent(new ZoomMouse());
    let newPosition = vec3.create(); vec3.set(newPosition, 0, 0, 5);
    if(!IS_SERVER){
      Renderer.camera.transform.setPosition(newPosition);
      Renderer.camera.transform.getParent().gameObject.addComponent(new RotateMouse());
    }
    //GameObject.prototype.SceneRoot.transform.children[0].gameObject.getComponent('Animation').play(0, true);


    GameObject.prototype.SceneRoot.transform.setScale(1);

    let moveBack = vec3.create(); vec3.set(moveBack, 3, 0, 0);
    GameObject.prototype.SceneRoot.transform.translate(moveBack);

    GameObject.prototype.SceneRoot.transform.children[0].children.forEach(function(child){
      if (child.gameObject.getComponent('Mesh')) {
        child.gameObject.getComponent('Mesh').material.setTexture(MaterialTexture.COLOR, albedo);
        child.gameObject.getComponent('Mesh').material.setTexture(MaterialTexture.MAT, mat);
        child.gameObject.getComponent('Mesh').material.setTexture(MaterialTexture.NORMAL, normal);
      }
    });

    let rotation = quat.create();
    quat.rotateX(rotation, rotation, -Math.PI/2);

    let container = new GameObject();
    GameObject.prototype.SceneRoot.addChild(container);

    let metalNum = 10;
    let roughNum = 10;
    let separation = 0.5;
    let yHeight = 20;
    for (let x=0; x<metalNum; ++x) {
        for (let y=0; y<roughNum; ++y) {
            let teapot = new GameObject();

            if (!IS_SERVER) {
              let mesh = new Mesh("Teapot02");
              let mat = new Material(Renderer.getShader(Renderer.DEFERRED_PBR_SHADER));

              let color = vec4.create();
              vec4.set(color, 1, 0.5, 0.1, 1);
              mat.setTexture(MaterialTexture.COLOR, Texture.makeColorTex(color));

              vec4.set(color, 0.5, 0.5, 1, 1);
              mat.setTexture(MaterialTexture.NORMAL, Texture.makeColorTex(color));

              vec4.set(color, x / (metalNum - 1), 0, y / (roughNum - 1), 1); //metalness, blank, roughness
              mat.setTexture(MaterialTexture.MAT, Texture.makeColorTex(color));

              if (x===1 && y===1){
                vec4.set(color, 1, 0, 0, 1);
                mat.setTexture(MaterialTexture.COLOR, Texture.makeColorTex(color));
              } else if( x===2 && y ===2){
                vec4.set(color, 0, 0, 1, 1);
                mat.setTexture(MaterialTexture.COLOR, Texture.makeColorTex(color));
              }

              mesh.setMaterial(mat);
              teapot.addComponent(mesh);
            }

            if (x===5 && y===5) {
                //add sound to a GameObject
                teapot.addComponent(new AudioSource());
                //if(!IS_SERVER) teapot.getComponent("AudioSource").playSound2d("cruelangel");
                teapot.addComponent(new PlayerController());
            }
            let pos = vec3.create(); vec3.set(pos, (x - metalNum/2.0)*separation, yHeight, -1 * (y - roughNum/2.0)*separation);

            if(x===1 && y===1){
              pos[1] = 0;
            } else if(x===2 && y===2){
              pos[1] = 0;
            }
            teapot.transform.setPosition(pos);
            teapot.transform.setRotation(rotation);
            teapot.transform.scale((0.02));

            if (x===1 && y===1){
              teapot.addComponent(new SphereCollider(0, true));
              teapot.addComponent(new SingingSwitch(5));
            }else if(x===2 && y===2){
              teapot.addComponent(new SphereCollider(0, true));
              teapot.addComponent(new TriggerTest());
            }else{
              teapot.addComponent(new SphereCollider(100, false, 10)); //set Transform BEFORE collider
            }

            container.addChild(teapot);
        }
    }

    GameObject.prototype.SceneRoot.transform.gameObject.getComponent("Collider").setLayer(FILTER_LEVEL_GEOMETRY);
    // GameObject.prototype.SceneRoot.transform.children[0].children[1].gameObject.getComponent("Collider").setLayer(FILTER_LEVEL_GEOMETRY);
    GameObject.prototype.SceneRoot.transform.children[1].children[55].gameObject.getComponent("Collider").setLayer(FILTER_PLAYER);

    PlayerTable.addPlayer(GameObject.prototype.SceneRoot.transform.children[1].children[55].gameObject);
    GameObject.prototype.SceneRoot.transform.children[1].children[55].gameObject.addComponent(new Sing());
    GameObject.prototype.SceneRoot.transform.children[1].children[55].gameObject.addComponent(new AudioSource());
    GameObject.prototype.SceneRoot.transform.children[1].children[56].gameObject.addComponent(new Sing());
    GameObject.prototype.SceneRoot.transform.children[1].children[56].gameObject.addComponent(new AudioSource());
    GameObject.prototype.SceneRoot.transform.children[1].children[57].gameObject.addComponent(new Sing());
    GameObject.prototype.SceneRoot.transform.children[1].children[57].gameObject.addComponent(new AudioSource());
    GameObject.prototype.SceneRoot.transform.children[1].children[58].gameObject.addComponent(new Sing());
    GameObject.prototype.SceneRoot.transform.children[1].children[58].gameObject.addComponent(new AudioSource());


    PlayerTable.addPlayer(GameObject.prototype.SceneRoot.transform.children[1].children[56].gameObject);
    GameObject.prototype.SceneRoot.transform.children[1].children[56].gameObject.addComponent(new PlayerController());
    PlayerTable.addPlayer(GameObject.prototype.SceneRoot.transform.children[1].children[57].gameObject);
    GameObject.prototype.SceneRoot.transform.children[1].children[57].gameObject.addComponent(new PlayerController());
    PlayerTable.addPlayer(GameObject.prototype.SceneRoot.transform.children[1].children[58].gameObject);
    GameObject.prototype.SceneRoot.transform.children[1].children[58].gameObject.addComponent(new PlayerController());

    if(!IS_SERVER) {
      GameObject.prototype.SceneRoot.transform.children[1].children[55].gameObject.getComponent("AudioSource").playSound2d("singTone00");
      GameObject.prototype.SceneRoot.transform.children[1].children[55].gameObject.getComponent("AudioSource").pauseSound();
      GameObject.prototype.SceneRoot.transform.children[1].children[56].gameObject.getComponent("AudioSource").playSound2d("singTone00");
      GameObject.prototype.SceneRoot.transform.children[1].children[56].gameObject.getComponent("AudioSource").pauseSound();
      GameObject.prototype.SceneRoot.transform.children[1].children[57].gameObject.getComponent("AudioSource").playSound2d("singTone00");
      GameObject.prototype.SceneRoot.transform.children[1].children[57].gameObject.getComponent("AudioSource").pauseSound();
      GameObject.prototype.SceneRoot.transform.children[1].children[58].gameObject.getComponent("AudioSource").playSound2d("singTone00");
      GameObject.prototype.SceneRoot.transform.children[1].children[58].gameObject.getComponent("AudioSource").pauseSound();
    }


    if(!IS_SERVER) {
      //TODO account for possibility of currentPlayer not set yet
      Renderer.camera.transform.getParent().gameObject.addComponent(new ClientStickTo(PlayerTable.players[PlayerTable.currentPlayer]));

      let light = new GameObject();
      let lightComp = new DirectionalLight(true);
      light.addComponent(lightComp);
      let lightPos = vec3.create();
      vec3.set(lightPos, 0, 0, 0);
      light.transform.setPosition(lightPos);
      light.transform.rotateX(-Math.PI / 4.0);

      let lightCenter = new GameObject();
      lightCenter.addChild(light);
      lightCenter.addComponent(new RotateOverTime(2.5));

      GameObject.prototype.SceneRoot.addChild(lightCenter);
    }

    //TODO REMOVE ME!!!!!!!!!1!
    // GameObject.prototype.SceneRoot.transform.children[1].children = [];
    // GameObject.prototype.SceneRoot.transform.children[2].children = [];
    // rootTest.transform.setScale(1);
    // GameObject.prototype.SceneRoot.transform.setScale(0.05);
    let pos = vec3.create(); vec3.set(pos, -27, 0, -9);
    let color = vec4.create(); vec4.set(color, 1, 0, 0, 1);
    let evilTeapot = Debug.drawTeapot(pos, color);
    evilTeapot.addComponent(new EvilController());

    let move = vec3.create(); vec3.set(move, 0,-1,0);
    let ground = new GameObject();
    ground.setName("ground");
    ground.transform.setPosition(move);
    let box = new BoxCollider(0, false, 10000, 1, 10000);
    ground.addComponent(box);
    ground.getComponent("Collider").setPhysicsMaterial(PhysicsEngine.materials.basicMaterial);
    ground.getComponent("Collider").setLayer(FILTER_LEVEL_GEOMETRY);

    GameObject.prototype.SceneRoot.findComponents("Interactable", PhysicsEngine.sphereChecks);
  }

  update() {
    // -- Physics update call will likely go here --
    if(Debug.clientUpdate)
    {
      PhysicsEngine.update();
    }

    if (!IS_SERVER) Renderer.camera.transform.getParent().gameObject.updateClient();
  }
}
