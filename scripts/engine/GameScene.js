/**
 * Created by Accipiter Chalybs on 4/14/2017.
 */

var albedo, mat, normal;

class GameScene {
    constructor(filenameList) {
        //Start loads here, do stuff with created objects in start()
        for (let filename of filenameList) {
            ObjectLoader.loadScene(filename); //TODO add callback to group these together
        }

        //TODO this will be moved into the JSON files
        if (IS_SERVER) {
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
        let newPosition = vec3.create(); vec3.set(newPosition, 0, 0, 5);
        Renderer.camera.transform.setPosition(newPosition);

        Renderer.camera.transform.getParent().gameObject.addComponent(new RotateMouse());
        //Renderer.camera.transform.getParent().gameObject.addComponent(new PlayerController());

        GameObject.prototype.SceneRoot.getComponent('Animation').play(0, true);

/*
        let moveBack = vec3.create(); vec3.set(moveBack, 3, 0, 0);
         GameObject.prototype.SceneRoot.transform.translate(moveBack);

         GameObject.prototype.SceneRoot.transform.children.forEach(function(child){
         child.gameObject.getComponent('Mesh').material.setTexture(MaterialTexture.COLOR, albedo);
         child.gameObject.getComponent('Mesh').material.setTexture(MaterialTexture.MAT, mat);
         child.gameObject.getComponent('Mesh').material.setTexture(MaterialTexture.NORMAL, normal);
         });*/




        let rotation = quat.create();
        quat.rotateX(rotation, rotation, -Math.PI/2);

        let container = new GameObject();
        container.transform.scale(0.02);
        GameObject.prototype.SceneRoot.addChild(container);

        let metalNum = 10;
        let roughNum = 10;
        let separation = 27;
        let yHeight = -25;
        for (let x=0; x<metalNum; ++x) {
            for (let y=0; y<roughNum; ++y) {
                let teapot = new GameObject();

                if (!IS_SERVER) {
                    let mesh = new Mesh("Teapot02");
                    let mat = new Material(Renderer.getShader(Renderer.FORWARD_PBR_SHADER));

                    let color = vec4.create();
                    vec4.set(color,1,0.5,0.1,1);
                    mat.setTexture(MaterialTexture.COLOR, Texture.makeColorTex(color));

                    vec4.set(color,0.5,0.5,1,1);
                    mat.setTexture(MaterialTexture.NORMAL, Texture.makeColorTex(color));

                    vec4.set(color,x/(metalNum-1),0,y/(roughNum-1),1); //metalness, blank, roughness
                    mat.setTexture(MaterialTexture.MAT, Texture.makeColorTex(color));

                    mesh.setMaterial(mat);
                    teapot.addComponent(mesh);
                }

                let pos = vec3.create(); vec3.set(pos, (x - metalNum/2.0)*separation, yHeight, -1 * (y - roughNum/2.0)*separation);

                if (x===5 && y===5) {
                    //add sound to a GameObject
                    teapot.addComponent(new AudioSource());
                    teapot.getComponent("AudioSource").playSound3d("cruelangel");
                    teapot.addComponent(new PlayerController());
                }

                teapot.transform.setPosition(pos);
                teapot.transform.setRotation(rotation);
                container.addChild(teapot);
            }
        }

        /*
        //GameObject.prototype.SceneRoot.transform.setRotation(rotation);

        let move = vec3.create(); vec3.set(move, 0, 0, 64);
        GameObject.prototype.SceneRoot.transform.children[1].setPosition(move);
        GameObject.prototype.SceneRoot.transform.children[1].gameObject.addComponent(new PlayerController());
        move = vec3.create(); vec3.set(move, 0, 0, -64);
        GameObject.prototype.SceneRoot.transform.children[0].setPosition(move);

        GameObject.prototype.SceneRoot.transform.children[0].gameObject.addComponent(new RotateOverTime(-1));

        GameObject.prototype.SceneRoot.transform.children[2].gameObject.getComponent('Mesh').material.setTexture(MaterialTexture.COLOR,
            new Texture('assets/skybox/skybox.jpg'));

        let mat = vec4.create(); vec4.set(mat, 1, 0, 0.15, 1);
        GameObject.prototype.SceneRoot.transform.children[2].gameObject.getComponent('Mesh').material.setTexture(MaterialTexture.MAT,

            Texture.makeColorTex(mat));
            Texture.makeColorTex(mat));*/

    }

    update() {
        // -- Physics update call will likely go here --
        Renderer.camera.transform.getParent().gameObject.update(); //TODO remove this one when SceneRoot contains all objects

        //Move to listener component in future updates
        let cameraAPos = Renderer.camera.transform.getWorldPosition();
        Howler.pos(cameraAPos[0],cameraAPos[1],cameraAPos[2]);
    }
}
