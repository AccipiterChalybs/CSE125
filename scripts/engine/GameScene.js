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

    //TODO this will be moved into the JSON files
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
    let newPosition = vec3.create(); vec3.set(newPosition, 0, 0, 5);
    if(!IS_SERVER){
      Renderer.camera.transform.setPosition(newPosition);
      Renderer.camera.transform.getParent().gameObject.addComponent(new RotateMouse());
    }
    //GameObject.prototype.SceneRoot.getComponent('Animation').play(0, true);

/*
    let moveBack = vec3.create(); vec3.set(moveBack, 3, 0, 0);
     GameObject.prototype.SceneRoot.transform.translate(moveBack);

     GameObject.prototype.SceneRoot.transform.children.forEach(function(child){
     child.gameObject.getComponent('Mesh').material.setTexture(MaterialTexture.COLOR, albedo);
     child.gameObject.getComponent('Mesh').material.setTexture(MaterialTexture.MAT, mat);
     child.gameObject.getComponent('Mesh').material.setTexture(MaterialTexture.NORMAL, normal);
     });


*/

    let rotation = quat.create();
    quat.rotateX(rotation, rotation, -Math.PI/2);


    GameObject.prototype.SceneRoot.transform.setScale(1);


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
              let mat = new Material(Renderer.getShader(Renderer.FORWARD_PBR_SHADER));

              let color = vec4.create();
              vec4.set(color, 1, 0.5, 0.1, 1);
              mat.setTexture(MaterialTexture.COLOR, Texture.makeColorTex(color));

              vec4.set(color, 0.5, 0.5, 1, 1);
              mat.setTexture(MaterialTexture.NORMAL, Texture.makeColorTex(color));

              vec4.set(color, x / (metalNum - 1), 0, y / (roughNum - 1), 1); //metalness, blank, roughness
              mat.setTexture(MaterialTexture.MAT, Texture.makeColorTex(color));

              mesh.setMaterial(mat);
              teapot.addComponent(mesh);
            }

            if (x===5 && y===5) {
                //add sound to a GameObject
                teapot.addComponent(new AudioSource());
                if(!IS_SERVER) teapot.getComponent("AudioSource").playSound3d("cruelangel");
                teapot.addComponent(new PlayerController());
                rootTest.transform.scale(50);
                teapot.addChild(rootTest);
            }
            let pos = vec3.create(); vec3.set(pos, (x - metalNum/2.0)*separation, yHeight, -1 * (y - roughNum/2.0)*separation);

            teapot.transform.setPosition(pos);
            teapot.transform.setRotation(rotation);
            teapot.transform.scale((0.02));
            teapot.addComponent(new SphereCollider(100, false, 10)); //set Transform BEFORE collider

            if (x===5 && y===5) teapot.transform.setRotation(quat.create()); //TODO make it so rotation isn't needed

            container.addChild(teapot);
        }
    }

    //let move = vec3.create(); vec3.set(move, 0, 500, 64);
    let move = vec3.create(); vec3.set(move, 0,-1,0);
    let ground = new GameObject();
    ground.setName("ground");
    ground.transform.setPosition(move);
    ground.addComponent(new BoxCollider(0, false, 10000, 1, 10000));
    ground.getComponent("Collider").setPhysicsMaterial(PhysicsEngine.materials.basicMaterial);
  }

  update() {
    // -- Physics update call will likely go here --
    if(Debug.clientUpdate)
    {
      PhysicsEngine.update();
    }
  }
}
