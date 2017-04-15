/**
 * Created by Accipiter Chalybs on 4/14/2017.
 */


class GameScene {
    constructor(filenameList) {
        //Start loads here, do stuff with created objects in start()
        for (let filename of filenameList) {
            ObjectLoader.loadScene(filename); //TODO add callback to group these together
        }
    }

    start() {
        let camera = new Camera();
        new GameObject().addComponent(camera);
        let rootTest = new GameObject();
        camera.gameObject.transform.setParent(rootTest.transform);
        let newPosition = vec3.create(); vec3.set(newPosition, 0, 0, 2.5);
        Renderer.camera.transform.setPosition(newPosition);

        let rotation = quat.create();
        quat.rotateX(rotation, rotation, -Math.PI/2);
        GameObject.prototype.SceneRoot.transform.setRotation(rotation);
        let move = vec3.create(); vec3.set(move, 0, 0, 64);
        GameObject.prototype.SceneRoot.transform.children[1].setPosition(move);
        GameObject.prototype.SceneRoot.transform.children[1].gameObject.addComponent(new PlayerController());
        move = vec3.create(); vec3.set(move, 0, 0, -64);
        GameObject.prototype.SceneRoot.transform.children[0].setPosition(move);

        GameObject.prototype.SceneRoot.transform.children[0].gameObject.addComponent(new RotateOverTime(-1));

        Renderer.camera.transform.getParent().gameObject.addComponent(new RotateMouse());
    }

    update() {
        Renderer.camera.transform.getParent().gameObject.update();
    }
}

