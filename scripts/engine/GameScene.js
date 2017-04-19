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
        albedo = new Texture('assets/texture/dungeon-stone1-albedo2.png');
        mat = new Texture('assets/texture/dungeon-stone1-mat.png');
        normal = new Texture('assets/texture/dungeon-stone1-normal.png');
    }

    start() {
        let camera = new Camera();
        new GameObject().addComponent(camera);
        let rootTest = new GameObject();
        camera.gameObject.transform.setParent(rootTest.transform);
        let newPosition = vec3.create(); vec3.set(newPosition, 0, 0, 2.5);
        Renderer.camera.transform.setPosition(newPosition);

        Renderer.camera.transform.getParent().gameObject.addComponent(new RotateMouse());
        //Renderer.camera.transform.getParent().gameObject.addComponent(new PlayerController());

        let rotation = quat.create();
        quat.rotateX(rotation, rotation, -Math.PI/2);
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

        /*
        GameObject.prototype.SceneRoot.transform.children.forEach(function(child){
          child.gameObject.getComponent('Mesh').material.setTexture(MaterialTexture.COLOR, albedo);
          child.gameObject.getComponent('Mesh').material.setTexture(MaterialTexture.MAT, mat);
          child.gameObject.getComponent('Mesh').material.setTexture(MaterialTexture.NORMAL, normal);
        });
           */
        //add sound to a GameObject
        GameObject.prototype.SceneRoot.transform.children[1].gameObject.addComponent(new AudioSource("ruready"))
    }

    update() {
        // -- Physics update call will likely go here --
        Renderer.camera.transform.getParent().gameObject.update(); //TODO remove this one when SceneRoot contains all objects
        let cameraAPos = Renderer.camera.transform.getWorldPosition();
        Howler.pos(cameraAPos[0],cameraAPos[1],cameraAPos[2]);
    }
}
